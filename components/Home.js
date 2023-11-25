import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";
import confetti from "canvas-confetti";

function Home() {
  const [reverbLevel, setReverbLevel] = useState(0);
  const [lastPlayed, setLastPlayed] = useState(null);
  const [activeKeys, setActiveKeys] = useState({});
  const [progress, setProgress] = useState({});
  const sounds = useRef({});
  const progressIntervals = useRef({});
  const audioContext = useRef(null);
  const analyser = useRef(null);
  const animationFrameId = useRef(null);
  const canvasRef = useRef(null);
  const reverbLevelRef = useRef(reverbLevel);
  const [volume, setVolume] = useState(0.5);
  const [isFrenchLayout, setIsFrenchLayout] = useState(false);
  const activeTouches = useRef({});
  const [isAutoplaying, setIsAutoplaying] = useState(false);
  const [confettiInterval, setConfettiInterval] = useState(null);
  const bufferSourceRef = useRef();

  const [isMagicActive, setIsMagicActive] = useState(false);
  const audioBufferRef = useRef(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext ||
      window.webkitAudioContext)();

    fetch("/glitch_full.mp3")
      .then((response) => {
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => {
        return audioContext.current.decodeAudioData(arrayBuffer);
      })
      .then((audioBuffer) => {
        audioBufferRef.current = audioBuffer;

        bufferSourceRef.current = audioContext.current.createBufferSource();
        bufferSourceRef.current.buffer = audioBufferRef.current;
        bufferSourceRef.current.loop = true;
        bufferSourceRef.current.connect(analyser.current);
      })
      .catch((e) => console.error(e));

    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
      if (bufferSourceRef.current) {
        bufferSourceRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    reverbLevelRef.current = reverbLevel;
  }, [reverbLevel]);

  useEffect(() => {
    Object.values(sounds.current).forEach((soundObj) => {
      if (soundObj && soundObj.audio) {
        soundObj.audio.volume = volume;
      }
    });
  }, [volume]);

  useEffect(() => {
    if (typeof AudioContext !== "undefined") {
      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();

      const convolver = audioContext.current.createConvolver();
      const impulseResponseUrl = "/IRNK.wav";
      fetch(impulseResponseUrl)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) =>
          audioContext.current.decodeAudioData(arrayBuffer)
        )
        .then((audioBuffer) => {
          convolver.buffer = audioBuffer;
          convolver.connect(analyser.current);
          convolver.connect(audioContext.current.destination);
        })
        .catch((error) =>
          console.error("Error loading impulse response:", error)
        );
      sounds.current.globalConvolver = convolver;

      const soundNames = [
        "glitch_vocal1",
        "glitch_vocal2",
        "glitch_vocal3",
        "glitch_vocal4",
        "glitch_kick1",
        "glitch_kick2",
        "glitch_perc1",
        "glitch_perc2",
        "glitch_hat1",
        "glitch_hat2",
        "glitch_snare1",
        "glitch_snare2",
        "glitch_chords1",
        "glitch_chords2",
        "glitch_chords3",
        "glitch_chords4",
        "glitch_full",
      ];
      soundNames.forEach((soundName) => {
        initializeSound(soundName);
      });

      drawVisualisation();
    }

    window.addEventListener("keydown", handleGlobalKeyPress);
    window.addEventListener("keyup", handleGlobalKeyUp);

    return () => {
      if (audioContext.current) {
        analyser.current.disconnect();
        audioContext.current.close();
      }
      window.removeEventListener("keydown", handleGlobalKeyPress);
      window.removeEventListener("keyup", handleGlobalKeyUp);
      cancelAnimationFrame(animationFrameId.current);
      Object.keys(progressIntervals.current).forEach((key) => {
        if (progressIntervals.current[key]) {
          cancelAnimationFrame(progressIntervals.current[key]);
        }
      });
    };
  }, [isFrenchLayout]);

  function startAudioContext() {
    if (audioContext.current && audioContext.current.state === "suspended") {
      audioContext.current.resume().then(() => {});
    }
  }

  function initializeSound(soundName) {
    const sound = new Audio("/" + soundName + ".mp3");
    sound.volume = volume;
    const sourceNode = audioContext.current.createMediaElementSource(sound);
    const dryNode = audioContext.current.createGain();
    const reverbNode = audioContext.current.createGain();
    sourceNode.connect(dryNode);
    sourceNode.connect(reverbNode);
    dryNode.connect(analyser.current);
    dryNode.connect(audioContext.current.destination);
    reverbNode.connect(sounds.current.globalConvolver);
    sounds.current[soundName] = {
      audio: sound,
      sourceNode,
      dryNode,
      reverbNode,
    };
  }

  function setSoundParameters(melody) {
    if (sounds.current[melody]) {
      const reverbLevelValue = reverbLevelRef.current / 100;
      sounds.current[melody].reverbNode.gain.value = reverbLevelValue;
    }
  }

  function PlaySound(melody, key) {
    setSoundParameters(melody);

    if (audioContext.current && audioContext.current.state === "suspended") {
      audioContext.current.resume();
    }

    if (sounds.current[melody] && sounds.current[melody].audio) {
      const audioElement = sounds.current[melody].audio;
      if (!audioElement.paused) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }

      audioElement.play();
      setLastPlayed(melody);
      setProgress((prev) => ({ ...prev, [key]: 0 }));
      if (progressIntervals.current[key]) {
        cancelAnimationFrame(progressIntervals.current[key]);
      }

      progressIntervals.current[key] = requestAnimationFrame(() =>
        updateProgress(audioElement, key)
      );
    }
  }

  function updateProgress(audioElement, key) {
    const newProgress =
      (audioElement.currentTime / audioElement.duration) * 100;
    setProgress((prev) => ({ ...prev, [key]: newProgress }));

    if (audioElement.ended || audioElement.paused) {
      setProgress((prev) => ({ ...prev, [key]: 0 }));
    } else {
      progressIntervals.current[key] = requestAnimationFrame(() =>
        updateProgress(audioElement, key)
      );
    }
  }

  const handleGlobalKeyPress = (event) => {
    setActiveKeys((prev) => ({ ...prev, [event.key]: true }));

    let keyToPlay = event.key;
    if (isFrenchLayout) {
      const keyMap = {
        a: "q",
        z: "w",
        q: "a",
        m: ";",
        w: "z",
        ",": "m",
        ";": "m",
      };
      keyToPlay = keyMap[event.key] || event.key;
    }

    const soundMap = {
      q: "glitch_vocal1",
      w: "glitch_vocal2",
      e: "glitch_vocal3",
      r: "glitch_vocal4",
      u: "glitch_kick1",
      i: "glitch_perc1",
      o: "glitch_hat1",
      p: "glitch_snare1",
      a: "glitch_chords1",
      s: "glitch_chords2",
      d: "glitch_chords3",
      f: "glitch_chords4",
      j: "glitch_kick2",
      k: "glitch_perc2",
      l: "glitch_hat2",
      ";": "glitch_snare2",
    };

    const soundToPlay = soundMap[keyToPlay];
    if (soundToPlay && sounds.current[soundToPlay]) {
      PlaySound(soundToPlay, keyToPlay);
    }
  };

  const handleGlobalKeyUp = (event) => {
    setActiveKeys((prev) => ({ ...prev, [event.key]: false }));
  };

  const getKeyStyle = (keyName) => {
    const reverseKeyMap = {
      q: "a",
      w: "z",
      a: "q",
      z: "w",
      m: ",",
      ";": "m",
    };

    let actualKeyName = keyName;
    if (isFrenchLayout) {
      actualKeyName = reverseKeyMap[keyName] || keyName;
    }

    const isActive = activeKeys[actualKeyName];
    return isActive
      ? `${styles.keybutton2} keybutton inline-block cursor-pointer text-center text-sm text-gray-700 border border-gray-200  font-bold rounded-lg m-1 w-[85px] md:w-28 md:py-3 py-3 my-3 transition duration-200 ease-in-out relative hover:shadow-lg active:shadow-inner`
      : `${styles.keybutton} keybutton inline-block cursor-pointer text-center text-sm text-gray-700 border border-gray-200 rounded-lg m-1 w-[85px] md:w-28 md:py-3 py-3 my-3 transition duration-200 ease-in-out relative hover:shadow-lg active:shadow-inner`;
  };

  const renderProgressBar = (keyName) => {
    if (isAutoplaying) return null;

    return (
      <div
        className="absolute bottom-0 left-0 bg-neutral-800/20 h-full"
        style={{ width: `${progress[keyName] || 0}%` }}
      ></div>
    );
  };

  function drawVisualisation() {
    if (!canvasRef.current || !analyser.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.current.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, width, height);

    let barWidth = (width / bufferLength) * 30;
    let barSpacing = 2;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2;

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#E07A37");
      gradient.addColorStop(1, "#e0875e");

      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth + barSpacing;
    }

    animationFrameId.current = requestAnimationFrame(drawVisualisation);
  }

  const openNK = () => {
    window.open("https://www.nikitakofman.com", "_blank");
  };

  const handleTouchStart = (event, key) => {
    event.preventDefault();

    const soundMap = {
      q: "glitch_vocal1",
      w: "glitch_vocal2",
      e: "glitch_vocal3",
      r: "glitch_vocal4",
      u: "glitch_kick1",
      i: "glitch_perc1",
      o: "glitch_hat1",
      p: "glitch_snare1",
      a: "glitch_chords1",
      s: "glitch_chords2",
      d: "glitch_chords3",
      f: "glitch_chords4",
      j: "glitch_kick2",
      k: "glitch_perc2",
      l: "glitch_hat2",
      ";": "glitch_snare2",
    };

    const soundToPlay = soundMap[key];

    if (soundToPlay) {
      PlaySound(soundToPlay, key);

      activeTouches.current[key] = true;
    }
  };

  const handleTouchEnd = (key) => {
    event.preventDefault();
    activeTouches.current[key] = false;
  };

  const triggerMagic = () => {
    if (!isMagicActive) {
      startAudioContext();

      confetti({
        particleCount: 100,
        startVelocity: 30,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
      });

      const interval = setInterval(() => {
        confetti({
          particleCount: 100,
          startVelocity: 30,
          spread: 360,
          origin: { x: Math.random(), y: Math.random() * 0.5 },
        });
      }, 600);
      setConfettiInterval(interval);

      bufferSourceRef.current = audioContext.current.createBufferSource();
      bufferSourceRef.current.buffer = audioBufferRef.current;
      bufferSourceRef.current.loop = true;
      bufferSourceRef.current.loopStart = 0;
      bufferSourceRef.current.loopEnd = 4.8;

      bufferSourceRef.current.connect(audioContext.current.destination);
      if (analyser.current) {
        bufferSourceRef.current.connect(analyser.current);
      }

      if (!bufferSourceRef.current.isPlaying) {
        bufferSourceRef.current.start(0);
        bufferSourceRef.current.isPlaying = true;
      }

      setIsMagicActive(true);
    } else {
      clearInterval(confettiInterval);

      if (bufferSourceRef.current && bufferSourceRef.current.isPlaying) {
        bufferSourceRef.current.stop();
        bufferSourceRef.current.disconnect();
        bufferSourceRef.current = null;
      }

      setIsMagicActive(false);
    }
  };

  const handleLayoutAndMagicChange = () => {
    setIsFrenchLayout((prevLayout) => !prevLayout);

    if (isMagicActive) {
      clearInterval(confettiInterval);
      setIsMagicActive(false);
    }
  };

  const buyCoffee = () => {
    window.open("https://www.buymeacoffee.com/nikitakofman", "_blank");
  };

  return (
    <div
      className="video-background sm:h-screen  flex flex-col items-center justify-center"
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      <video
        autoPlay
        loop
        muted
        style={{
          position: "absolute",
          width: "100%",
          left: "50%",
          top: "50%",
          height: "100%",
          objectFit: "cover",
          transform: "translate(-50%, -50%)",
          zIndex: "-1",
        }}
      >
        <source src="/bga1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div
        className="flex sm:h-40 sm:mt-8 text-5xl mb-3 w-full flex-col text-center items-center justify-center"
        style={{ fontFamily: "Nabla" }}
      >
        <p className="mt-5">BEAT ODYSSEY</p>
        <div className="flex">
          <p
            className="text-xs flex mt-3 font-extralight text-white cursor-pointer hover:text-slate-300"
            style={{ fontFamily: "Chivo" }}
            onClick={openNK}
          >
            made by nikitakofman.com
          </p>
          <p
            className="text-xs flex mt-3 ml-2 font-extralight text-white"
            style={{ fontFamily: "Chivo" }}
          >
            best enjoyed on a desktop
          </p>
        </div>
      </div>
      <div className="sm:hidden mt-2 flex">
        {" "}
        <button
          onClick={triggerMagic}
          className={`relative rounded-lg sm:hidden text-xs py-1 px-2 mr-2 w-24 ml-1 mb-1 ${
            styles.animatedborder
          } ${isMagicActive ? styles.rainbowanimation : ""}`}
        >
          <span className="relative text-white">Magic</span>
        </button>
        <img
          src="/coffee.png"
          onClick={buyCoffee}
          className="ml-2 h-[30px] cursor-pointer"
        />
      </div>
      <div className="items-center hidden flex-col sm:flex justify-center">
        <p className="text-white mr-3 font-semibold mb-2 text-xs">
          PLAY WITH YOUR KEYBOARD!{" "}
        </p>
        <div className="flex items-center mt-1 justify-center">
          <button
            onClick={triggerMagic}
            className={`relative rounded-lg  text-xs py-1 px-6 mr-2 ${
              styles.animatedborder
            } ${isMagicActive ? styles.rainbowanimation : ""}`}
          >
            <span className="relative text-white">Magic</span>
          </button>
          <button
            onClick={handleLayoutAndMagicChange}
            className=" cursor-pointer transition-all 
      bg-gray-700 text-white px-3 py-1 rounded-lg text-sm
      border-slate-300/80
      border-[1px] hover:brightness-110 hover:border-amber-400
       active:brightness-90 active:translate-y-1   hover:shadow-green-300 shadow-green-300 active:shadow-none  "
            style={{ fontFamily: "Chivo" }}
          >
            {isFrenchLayout ? "Switch to QWERTY" : "Switch to AZERTY"}
          </button>
          <img
            src="/coffee.png"
            onClick={buyCoffee}
            className="ml-2 h-[30px] mr-2 cursor-pointer"
          />
        </div>
      </div>
      <div className="flex sm:flex-col items-center justify-center">
        <div className="flex sm:flex-row mt-3 sm:mt-4 flex-col mb-3 ">
          <button
            type="button"
            className="m-1 inline-block px-3 py-3 mr-3 font-bold text-center text-white uppercase align-middle transition-all rounded-lg cursor-pointer bg-gradient-to-tl from-amber-700 to-red-500 leading-pro text-xs ease-soft-in tracking-tight-soft shadow-soft-md bg-150 bg-x-25 hover:scale-110 hover:rotate-2 hover:bg-amber-500 hover:shadow-lg active:opacity-85"
          >
            DUBSTEP
          </button>
          <button
            type="button"
            className="m-1 inline-block px-3 py-3 mr-3 font-bold text-center text-white uppercase align-middle transition-all rounded-lg cursor-pointer bg-gradient-to-tl from-blue-900 to-sky-300 leading-pro text-xs ease-soft-in tracking-tight-soft shadow-soft-md bg-150 bg-x-25 hover:scale-110 hover:rotate-2 hover:bg-amber-500  hover:shadow-lg active:opacity-85"
          >
            Liquid DNB
          </button>

          <button
            type="button"
            className="m-1 inline-block border-2 border-white px-3 py-3 mr-3 font-bold text-center text-white uppercase align-middle transition-all rounded-lg cursor-pointer bg-gradient-to-tl from-stone-600 to-lime-500 leading-pro text-xs ease-soft-in tracking-tight-soft shadow-soft-md bg-150 bg-x-25 hover:scale-110 hover:rotate-2 hover:bg-amber-500  hover:shadow-lg active:opacity-85"
          >
            GLITCH HOP
          </button>
          <button
            type="button"
            className="m-1 inline-block px-3 py-3 mr-3 font-bold text-center text-white uppercase align-middle transition-all rounded-lg cursor-pointer bg-gradient-to-tl from-indigo-600 to-stone-500 leading-pro text-xs ease-soft-in tracking-tight-soft shadow-soft-md bg-150 bg-x-25 hover:scale-110 hover:rotate-2 hover:bg-amber-500  hover:shadow-lg active:opacity-85"
          >
            TRANCE
          </button>
        </div>
        <div className="flex mt-4 mb-4 flex-col sm:flex-row">
          <div className="flex border-2  rounded-md bg-neutral-300 p-1.5 shadow-xl flex-col items-center justify-center m-2 sm:mr-10">
            <label className="mb-2 font-semibold">REVERB</label>
            <input
              type="range"
              value={reverbLevel}
              onChange={(event) =>
                setReverbLevel(parseInt(event.target.value, 10))
              }
            />
            <span className="mt-2 font-light">{reverbLevel}%</span>
          </div>
          <div className="flex border-2  rounded-md bg-neutral-300 p-1 shadow-xl flex-col items-center justify-center  m-2 sm:ml-10">
            <label htmlFor="volumeSlider" className="mb-2 font-semibold">
              VOLUME
            </label>
            <input
              id="volumeSlider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
            <span className="mt-2 font-light">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </div>
      <div className="flex h-full w-full flex-col sm:flex-row items-center justify-center">
        <div className="flex w-full  text-xs items-center justify-center ">
          <div className="flex flex-col w-full items-center justify-center">
            <div className="flex flex-wrap items-center justify-center">
              <div
                className={getKeyStyle("q")}
                onClick={() => {
                  PlaySound("glitch_vocal1", "q");
                  setSoundParameters("glitch_vocal1");
                }}
                onTouchStart={(event) => handleTouchStart(event, "q")}
                onTouchEnd={(event) => handleTouchEnd(event, "q")}
              >
                VOX 1{renderProgressBar("q")}
              </div>
              <div
                className={getKeyStyle("w")}
                onClick={() => {
                  PlaySound("glitch_vocal2", "w");
                  setSoundParameters("glitch_vocal2");
                }}
                onTouchStart={(event) => handleTouchStart(event, "w")}
                onTouchEnd={(event) => handleTouchEnd(event, "w")}
              >
                VOX 2{renderProgressBar("w")}
              </div>
              <div
                className={getKeyStyle("e")}
                onClick={() => {
                  PlaySound("glitch_vocal3", "e");
                  setSoundParameters("glitch_vocal3");
                }}
                onTouchStart={(event) => handleTouchStart(event, "e")}
                onTouchEnd={(event) => handleTouchEnd(event, "e")}
              >
                VOX 3{renderProgressBar("e")}
              </div>
              <div
                className={getKeyStyle("r")}
                onClick={() => {
                  PlaySound("glitch_vocal4", "r");
                  setSoundParameters("glitch_vocal4");
                }}
                onTouchStart={(event) => handleTouchStart(event, "r")}
                onTouchEnd={(event) => handleTouchEnd(event, "r")}
              >
                VOX 4{renderProgressBar("r")}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center">
              <div
                className={getKeyStyle("a")}
                onClick={() => {
                  PlaySound("glitch_chords1", "a");
                  setSoundParameters("glitch_chords1");
                }}
                onTouchStart={(event) => handleTouchStart(event, "a")}
                onTouchEnd={(event) => handleTouchEnd(event, "a")}
              >
                CHORD 1{renderProgressBar("a")}
              </div>
              <div
                className={getKeyStyle("s")}
                onClick={() => {
                  PlaySound("glitch_chords2", "s");
                  setSoundParameters("glitch_chords2");
                }}
                onTouchStart={(event) => handleTouchStart(event, "s")}
                onTouchEnd={(event) => handleTouchEnd(event, "s")}
              >
                CHORD 2{renderProgressBar("s")}
              </div>
              <div
                className={getKeyStyle("d")}
                onClick={() => {
                  PlaySound("glitch_chords3", "d");
                  setSoundParameters("glitch_chords3");
                }}
                onTouchStart={(event) => handleTouchStart(event, "d")}
                onTouchEnd={(event) => handleTouchEnd(event, "d")}
              >
                CHORD 3{renderProgressBar("d")}
              </div>
              <div
                className={getKeyStyle("f")}
                onClick={() => {
                  PlaySound("glitch_chords4", "f");
                  setSoundParameters("glitch_chords4");
                }}
                onTouchStart={(event) => handleTouchStart(event, "f")}
                onTouchEnd={(event) => handleTouchEnd(event, "f")}
              >
                CHORD 4{renderProgressBar("f")}
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center text-xs justify-center ">
          <div className="flex flex-col w-full items-center">
            <div className="flex flex-wrap items-center justify-center">
              <div
                className={getKeyStyle("u")}
                onClick={() => {
                  PlaySound("glitch_kick1", "u");
                  setSoundParameters("glitch_kick1");
                }}
                onTouchStart={(event) => handleTouchStart(event, "u")}
                onTouchEnd={(event) => handleTouchEnd(event, "u")}
              >
                KICK{renderProgressBar("u")}
              </div>
              <div
                className={getKeyStyle("i")}
                onClick={() => {
                  PlaySound("glitch_perc1", "i");
                  setSoundParameters("glitch_perc1");
                }}
                onTouchStart={(event) => handleTouchStart(event, "i")}
                onTouchEnd={(event) => handleTouchEnd(event, "i")}
              >
                PERC{renderProgressBar("i")}
              </div>
              <div
                className={getKeyStyle("o")}
                onClick={() => {
                  PlaySound("glitch_hat1", "o");
                  setSoundParameters("glitch_hat1");
                }}
                onTouchStart={(event) => handleTouchStart(event, "o")}
                onTouchEnd={(event) => handleTouchEnd(event, "o")}
              >
                HIHAT{renderProgressBar("o")}
              </div>
              <div
                className={getKeyStyle("p")}
                onClick={() => {
                  PlaySound("glitch_snare1", "p");
                  setSoundParameters("glitch_snare1");
                }}
                onTouchStart={(event) => handleTouchStart(event, "p")}
                onTouchEnd={(event) => handleTouchEnd(event, "p")}
              >
                SNARE{renderProgressBar("p")}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center">
              <div
                className={getKeyStyle("j")}
                onClick={() => {
                  PlaySound("glitch_kick2", "j");
                  setSoundParameters("glitch_kick2");
                }}
                onTouchStart={(event) => handleTouchStart(event, "j")}
                onTouchEnd={(event) => handleTouchEnd(event, "j")}
              >
                KICK 2{renderProgressBar("j")}
              </div>
              <div
                className={getKeyStyle("k")}
                onClick={() => {
                  PlaySound("glitch_perc2", "k");
                  setSoundParameters("glitch_perc2");
                }}
                onTouchStart={(event) => handleTouchStart(event, "k")}
                onTouchEnd={(event) => handleTouchEnd(event, "k")}
              >
                PERC 2{renderProgressBar("k")}
              </div>
              <div
                className={getKeyStyle("l")}
                onClick={() => {
                  PlaySound("glitch_hat2", "l");
                  setSoundParameters("glitch_hat2");
                }}
                onTouchStart={(event) => handleTouchStart(event, "l")}
                onTouchEnd={(event) => handleTouchEnd(event, "l")}
              >
                HIHAT 2{renderProgressBar("l")}
              </div>
              <div
                className={getKeyStyle(";")}
                onClick={() => {
                  PlaySound("glitch_snare2", ";");
                  setSoundParameters("glitch_snare2");
                }}
                onTouchStart={(event) => handleTouchStart(event, ";")}
                onTouchEnd={(event) => handleTouchEnd(event, ";")}
              >
                SNARE 2{renderProgressBar(";")}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <canvas ref={canvasRef} className="w-80" />
      </div>
    </div>
  );
}

export default Home;
