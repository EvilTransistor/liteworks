let mic;
let fft;
let circles = [];
let prevSpectrum;
let isPlaying = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  colorMode(HSB, 360, 100, 100);
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);
  console.log("setup called")
  for (let i = 0; i < 3; i++) {
    circles.push(new Circle(i * width / 3 + width / 6, height / 2));
  }
}

function draw() {
  if (isPlaying) {
    background(0);

    // Check if new audio data is available
    if (mic && mic.enabled && mic.getLevel() > 0.01) {
      let waveform = fft.waveform();
      let spectrum = fft.analyze();
      let spectralFlux = calculateSpectralFlux(spectrum, prevSpectrum);
      // console.log("spectralFlux: " + spectralFlux);
      // let threshold = calculateThreshold(spectralFlux);

      // console.log("Circles Arr length: " + circles.length);
      for (let i = 0; i < circles.length; i++) {
        let circle = circles[i];
        circle.update(spectralFlux);
        circle.display();
      }
      prevSpectrum = spectrum;

      // Draw waveform
      noFill();
      stroke(255);
      beginShape();
      for (let i = 0; i < waveform.length; i++) {
        let x = map(i, 0, waveform.length, 0, width);
        let y = map(waveform[i], -1, 1, height, 0);
        vertex(x, y);
      }
      endShape();
    } else {
      console.log("No audio input detected");
    }
  }
}

function calculateSpectralFlux(currentSpectrum, previousSpectrum) {
  let sum = 0;
  if (!previousSpectrum) previousSpectrum = new Array(currentSpectrum.length).fill(0);
  for (let i = 0; i < currentSpectrum.length; i++) {
    let diff = currentSpectrum[i] - previousSpectrum[i];
    sum += diff > 0 ? diff : 0;
  }
  return sum;
}

function calculateThreshold(spectralFlux) {
  let alpha = 0.8;
  let threshold = alpha * spectralFlux;
  return threshold;
}



class Circle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = color(random(360), 100, 100);
    this.hueIncrement = random(0.2, 1.0);
    this.radius = 50;
    this.minRadius = 3;
    this.maxRadius = 150;
  }

  update(beatIntensity) {
    // Map the beat intensity value to a range of circle radii
    this.radius = map(beatIntensity, 0, 255, this.minRadius, this.maxRadius);
    // Increment the hue value over time
    this.color = color((hue(this.color) + this.hueIncrement) % 255, 100, 100);
  }

  display() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
  }
}

function start() {
  if (!isPlaying) {
    isPlaying = true;
    getAudioContext().resume();
  }
}
