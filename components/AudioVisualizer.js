import React, { useEffect, useRef } from "react";
import p5 from "p5";
import "p5/lib/addons/p5.sound"; // Import the p5.sound addon

const AudioVisualizer = ({ analyser }) => {
  console.log("AudioVisualizer rendered", analyser);
  const canvasRef = useRef();

  useEffect(() => {
    if (!analyser) {
      return; // Wait for analyser to be available
    }
    let myp5;

    const sketch = (p) => {
      let fft;

      p.setup = () => {
        p.createCanvas(720, 400);
        fft = new p.FFT(); // Instantiate FFT using 'new'
        fft.setInput(analyser.current);
        console.log(analyser);
      };

      p.draw = () => {
        p.background(200);

        let spectrum = fft.analyze();
        console.log(spectrum);
        p.noStroke();
        p.fill(255, 0, 0); // Red color for visualization

        for (let i = 0; i < spectrum.length; i++) {
          let x = p.map(i, 0, spectrum.length, 0, p.width);
          let h = -p.height + p.map(spectrum[i], 0, 255, p.height, 0);
          p.rect(x, p.height, p.width / spectrum.length, h);
        }
      };
    };

    if (canvasRef.current && analyser) {
      myp5 = new p5(sketch, canvasRef.current);
    }

    return () => {
      if (myp5) {
        myp5.remove();
      }
    };
  }, [analyser]);

  return <div ref={canvasRef}>hello</div>;
};

export default AudioVisualizer;
