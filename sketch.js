let audioFile;
let fft;
let circles = [];
let prevSpectrum;
let isPlaying = false;

function preload() {
  audioFile = loadSound('./assets/Asato (Invader Space & Shadow Remix).mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  colorMode(HSB, 360, 100, 100);
  fft = new p5.FFT();
  for (let i = 0; i < 3; i++) {
    circles.push(new Circle(i * width / 3 + width / 6, height / 2));
  }
}

function draw() {
  if (isPlaying) {
    background(0);
    let spectrum = fft.analyze();
    let spectralFlux = calculateSpectralFlux(spectrum, prevSpectrum);
    let threshold = calculateThreshold(spectralFlux);
    let isBeat = spectrum[4] > threshold;
    for (let i = 0; i < circles.length; i++) {
      let circle = circles[i];
      circle.update(isBeat, spectralFlux);
      circle.display();
    }
    prevSpectrum = spectrum;
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
    this.radius = 50;
    this.maxRadius = 150;
  }

  update(isBeat, spectralFlux) {
    let factor = map(spectralFlux, 0, 30000, 0, 1);
    if (isBeat) {
      this.radius = this.maxRadius;
    } else {
      this.radius = 50 + (this.maxRadius - 50) * factor;
    }
  }

  display() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
  }
}

function start() {
  if (!isPlaying) {
    audioFile.play();
    isPlaying = true;
  }
}
