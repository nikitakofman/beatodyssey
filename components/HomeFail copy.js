import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useP5Sketch } from "./useP5Sketch"; // adjust the import path as needed

const P5Wrapper = dynamic(
  () => import("react-p5-wrapper").then((mod) => mod.ReactP5Wrapper),
  { ssr: false }
);

function Home() {
  const [lastPlayed, setLastPlayed] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [progress, setProgress] = useState({});
  const sounds = useRef({});
  const progressIntervals = useRef({});
  const audioContext = useRef(null);
  const analyser = useRef(null);
  const sketchRef = useRef();

  useEffect(() => {
    // Initialize audio context and analyser node
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
    }

    // Event listeners for key press
    window.addEventListener("keydown", handleGlobalKeyPress);
    window.addEventListener("keyup", handleGlobalKeyUp);

    return () => {
      // Clean up
      if (audioContext.current) {
        analyser.current.disconnect();
        audioContext.current.close();
      }
      window.removeEventListener("keydown", handleGlobalKeyPress);
      window.removeEventListener("keyup", handleGlobalKeyUp);
    };
  }, []);

  const sketch = (p) => {
    let fft;

    p.setup = () => {
      p.createCanvas(720, 400);
      fft = new p.FFT();
      fft.setInput(analyser.current);
    };

    p.draw = () => {
      p.background(200);
      if (fft) {
        let spectrum = fft.analyze();
        p.noStroke();
        p.fill(255, 0, 0);
        for (let i = 0; i < spectrum.length; i++) {
          let x = p.map(i, 0, spectrum.length, 0, p.width);
          let h = -p.height + p.map(spectrum[i], 0, 255, p.height, 0);
          p.rect(x, p.height, p.width / spectrum.length, h);
        }
      }
    };
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

  function handleGlobalKeyPress(event) {
    setActiveKey(event.key);
    switch (event.key) {
      case "a":
        PlaySound("glitch_vocal1", "a");
        break;
      case "z":
        PlaySound("glitch_vocal2", "z");
        break;
      // ... Add cases for other keys
      default:
        break;
    }
  }

  function handleGlobalKeyUp(event) {
    setActiveKey(null);
  }

  function getKeyStyle(keyName) {
    return activeKey === keyName ? "key-style-active" : "key-style-inactive";
  }

  function renderProgressBar(keyName) {
    return (
      <div
        className="progress-bar"
        style={{ width: `${progress[keyName] || 0}%` }}
      ></div>
    );
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
      {/* <canvas
        ref={canvasRef}
        className="w-full max-w-lg border-2 border-black text-slate-200"
      /> */}

      <P5Wrapper sketch={sketch} />
    </div>
  );
}

export default Home;
