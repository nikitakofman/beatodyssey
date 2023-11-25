import { useEffect } from "react";
import dynamic from "next/dynamic";

const useP5Sketch = (analyser) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const P5 = dynamic(() => import("p5"), { ssr: false });

      P5.then((p5) => {
        let sketch = (p) => {
          let fft;

          p.setup = () => {
            p.createCanvas(720, 400);
            fft = new p5.FFT();
            fft.setInput(analyser);
          };

          p.draw = () => {
            p.background(200);
            let spectrum = fft.analyze();
            p.noStroke();
            p.fill(255, 0, 0);
            for (let i = 0; i < spectrum.length; i++) {
              let x = p.map(i, 0, spectrum.length, 0, p.width);
              let h = -p.height + p.map(spectrum[i], 0, 255, p.height, 0);
              p.rect(x, p.height, p.width / spectrum.length, h);
            }
          };
        };

        let myp5 = new p5(sketch);

        return () => {
          myp5.remove();
        };
      });
    }
  }, [analyser]);
};

export default useP5Sketch;
