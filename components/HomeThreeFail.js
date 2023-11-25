import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";

function Home() {
  const [lastPlayed, setLastPlayed] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [progress, setProgress] = useState({});
  const sounds = useRef({});
  const progressIntervals = useRef({});
  const audioContext = useRef(null);
  const analyser = useRef(null);
  const animationFrameId = useRef(null);
  const threeContainerRef = useRef(null);
  const bars = useRef([]);

  useEffect(() => {
    if (typeof AudioContext !== "undefined") {
      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
    }

    initThreeJS();
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
  }, []);

  const initThreeJS = () => {
    const width = threeContainerRef.current.clientWidth;
    const height = threeContainerRef.current.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 50;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    threeContainerRef.current.appendChild(renderer.domElement);

    analyser.current.fftSize = 2048; // Example configuration, adjust as needed
    const bufferLength = analyser.current.frequencyBinCount;
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); // Adjust the size of bars
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < bufferLength; i++) {
      const bar = new THREE.Mesh(geometry, material);
      bar.position.x = (i - bufferLength / 2) * 1.5; // Adjust positioning
      bar.position.y = 0;
      bar.scale.y = 10; // Set a visible initial scale
      scene.add(bar);
      bars.current.push(bar);
    }

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const dataArray = new Uint8Array(bufferLength);
      analyser.current.getByteFrequencyData(dataArray);

      bars.current.forEach((bar, i) => {
        bar.scale.y = dataArray[i] / 5; // Scale based on audio data, adjust as needed
      });

      renderer.render(scene, camera);
    };

    animate();
  };

  function PlaySound(melody, key) {
    if (audioContext.current && audioContext.current.state === "suspended") {
      audioContext.current.resume();
    }

    if (!sounds.current[melody]) {
      const path = "/";
      sounds.current[melody] = new Audio(path + melody + ".mp3");
      sounds.current[melody].volume = 0.5;

      if (!sounds.current[melody].sourceNode) {
        sounds.current[melody].sourceNode =
          audioContext.current.createMediaElementSource(sounds.current[melody]);
        sounds.current[melody].sourceNode.connect(analyser.current);
        analyser.current.connect(audioContext.current.destination);
      }

      console.log(audioContext);
      // sounds.current[melody].addEventListener("canplaythrough", () => {
      //   if (!sounds.current[melody].sourceNode) {
      //     sounds.current[melody].sourceNode =
      //       audioContext.current.createMediaElementSource(
      //         sounds.current[melody]
      //       );
      //     sounds.current[melody].sourceNode.connect(analyser.current);
      //   }
      //   analyser.current.connect(audioContext.current.destination);
      // });
    }

    const sound = sounds.current[melody];
    if (!sound.paused) {
      sound.pause();
      sound.currentTime = 0;
    }

    sound.play();
    setLastPlayed(melody);
    setProgress((prev) => ({ ...prev, [key]: 0 }));
    if (progressIntervals.current[key]) {
      cancelAnimationFrame(progressIntervals.current[key]);
    }

    const updateProgress = () => {
      const newProgress = (sound.currentTime / sound.duration) * 100;
      setProgress((prev) => ({ ...prev, [key]: newProgress }));

      if (sound.ended || sound.paused) {
        setProgress((prev) => ({ ...prev, [key]: 0 }));
      } else {
        progressIntervals.current[key] = requestAnimationFrame(updateProgress);
      }
    };

    progressIntervals.current[key] = requestAnimationFrame(updateProgress);
  }

  const handleGlobalKeyPress = (event) => {
    setActiveKey(event.key);

    switch (event.key) {
      case "a":
        PlaySound("glitch_vocal1", "a");
        break;
      case "z":
        PlaySound("glitch_vocal2", "z");
        break;
      case "e":
        PlaySound("glitch_vocal3", "e");
        break;
      case "r":
        PlaySound("glitch_vocal4", "r");
        break;
      case "u":
        PlaySound("glitch_kick1", "u");
        break;
      case "i":
        PlaySound("glitch_perc1", "i");
        break;
      case "o":
        PlaySound("glitch_hat1", "o");
        break;
      case "p":
        PlaySound("glitch_snare1", "p");
        break;
      case "q":
        PlaySound("glitch_chords1", "q");
        break;
      case "s":
        PlaySound("glitch_chords2", "s");
        break;
      case "d":
        PlaySound("glitch_chords3", "d");
        break;
      case "f":
        PlaySound("glitch_chords4", "f");
        break;
      case "j":
        PlaySound("glitch_kick2", "j");
        break;
      case "k":
        PlaySound("glitch_perc2", "k");
        break;
      case "l":
        PlaySound("glitch_hat2", "l");
        break;
      case "m":
        PlaySound("glitch_snare2", "m");
        break;
      default:
        break;
    }
  };

  const handleGlobalKeyUp = (event) => {
    setActiveKey(null);
  };

  const getKeyStyle = (keyName) => {
    return activeKey === keyName
      ? "p-3 w-20 flex items-center justify-center m-2 bg-sky-700 text-white relative border-2 border-slate-200"
      : "p-3 w-20 flex items-center justify-center m-2 bg-sky-800 text-white relative border-slate-400 border-2 shadow-lg shadow-slate-500";
  };

  const renderProgressBar = (keyName) => {
    return (
      <div
        className="absolute bottom-0 left-0 bg-sky-100/20 h-full"
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

    let barWidth = (width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2;
      ctx.fillStyle = `rgb(${barHeight + 100}, 3, 180)`;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }

    animationFrameId.current = requestAnimationFrame(drawVisualisation);
  }

  return (
    <div className="h-screen bg-sky-100 flex flex-col items-center justify-center">
      <div className="flex h-40 text-3xl w-full items-center justify-center">
        Simple Drum Kit
      </div>
      <div className="flex h-full w-full flex-col sm:flex-row items-center justify-center">
        <div className="flex w-full  text-xs items-center justify-center border-2 border-black">
          <div className="flex flex-col w-full items-center justify-center">
            <div className="flex flex-wrap items-center justify-center">
              <div
                className={getKeyStyle("a")}
                onClick={() => PlaySound("glitch_vocal1", "a")}
              >
                Vox 1{renderProgressBar("a")}
              </div>
              <div
                className={getKeyStyle("z")}
                onClick={() => PlaySound("glitch_vocal2", "z")}
              >
                Vox 2{renderProgressBar("z")}
              </div>
              <div
                className={getKeyStyle("e")}
                onClick={() => PlaySound("glitch_vocal3", "e")}
              >
                Vox 3{renderProgressBar("e")}
              </div>
              <div
                className={getKeyStyle("r")}
                onClick={() => PlaySound("glitch_vocal4", "r")}
              >
                Vox 4{renderProgressBar("r")}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center">
              <div
                className={getKeyStyle("q")}
                onClick={() => PlaySound("glitch_chords1", "q")}
              >
                Chord 1{renderProgressBar("q")}
              </div>
              <div
                className={getKeyStyle("s")}
                onClick={() => PlaySound("glitch_chords2", "s")}
              >
                Chord 2{renderProgressBar("s")}
              </div>
              <div
                className={getKeyStyle("d")}
                onClick={() => PlaySound("glitch_chords3", "d")}
              >
                Chord 3{renderProgressBar("d")}
              </div>
              <div
                className={getKeyStyle("f")}
                onClick={() => PlaySound("glitch_chords4", "f")}
              >
                Chord 4{renderProgressBar("f")}
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center text-xs justify-center  border-2 border-black">
          <div className="flex flex-col w-full items-center">
            <div className="flex flex-wrap items-center justify-center">
              <div
                className={getKeyStyle("u")}
                onClick={() => PlaySound("glitch_kick1", "u")}
              >
                Kick{renderProgressBar("u")}
              </div>
              <div
                className={getKeyStyle("i")}
                onClick={() => PlaySound("glitch_perc1", "i")}
              >
                Perc{renderProgressBar("i")}
              </div>
              <div
                className={getKeyStyle("o")}
                onClick={() => PlaySound("glitch_hat1", "o")}
              >
                Hihat{renderProgressBar("o")}
              </div>
              <div
                className={getKeyStyle("p")}
                onClick={() => PlaySound("glitch_snare1", "p")}
              >
                Snare{renderProgressBar("p")}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center">
              <div
                className={getKeyStyle("j")}
                onClick={() => PlaySound("glitch_kick2", "j")}
              >
                Kick 2{renderProgressBar("j")}
              </div>
              <div
                className={getKeyStyle("k")}
                onClick={() => PlaySound("glitch_perc2", "k")}
              >
                Perc 2{renderProgressBar("k")}
              </div>
              <div
                className={getKeyStyle("l")}
                onClick={() => PlaySound("glitch_hat2", "l")}
              >
                Hihat 2{renderProgressBar("l")}
              </div>
              <div
                className={getKeyStyle("m")}
                onClick={() => PlaySound("glitch_snare2", "m")}
              >
                Snare 2{renderProgressBar("m")}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={threeContainerRef}
        className="w-full h-full max-w-lg  text-slate-200"
      />
    </div>
  );
}

export default Home;
