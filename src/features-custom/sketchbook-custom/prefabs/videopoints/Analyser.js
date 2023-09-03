import { DataTexture, RedFormat, LuminanceFormat } from "three"; // https://threejs.org/docs/#api/en/constants/Textures

let context;
let src;
let analyser;
function createMedia(audio) {
  if (window.contextAnalyser) {
    context = window.contextAnalyser;
    src = window.srcAnalyser;
    analyser = window.analyser;
  } else {
    context = new AudioContext();
    src = context.createMediaElementSource(audio);
    analyser = context.createAnalyser();
    src.connect(analyser);
    analyser.connect(context.destination);

    window.contextAnalyser = context;
    window.srcAnalyser = src;
    window.analyser = analyser;
  }
}

// fftSize = 512 || 2048 || potenciaDe2
export default class Analyser {
  constructor(audio, fftSize = 2048) {
    if (audio) {
      // const context = new AudioContext();
      createMedia(audio);
      analyser.fftSize = fftSize;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      this.fftSize = fftSize;
      this.bufferLength = bufferLength;
      this.context = context;
      this.analyser = analyser;
      this.dataArray = dataArray;
      this.dataTexture = undefined;
    } else {
      console.error("No se ha podido crear el Analyser");
    }
  }

  disconnect() {
    // this.analyser.disconnect();
  }

  getDataTexture() {
    if (!this.dataTexture) {
      const format = RedFormat;
      this.dataTexture = new DataTexture(
        this.dataArray,
        this.bufferLength,
        1,
        format
      );
    }
    return this.dataTexture;
  }

  update() {
    if (this.analyser && this.dataArray)
      this.analyser.getByteFrequencyData(this.dataArray);
  }

  getLowerMax() {
    const lowerHalfArray = this.getLowerHalfArray();
    return Math.max(...this.getLowerHalfArray()) / lowerHalfArray.length;
  }

  getUpdateLowerMax() {
    this.update();
    return this.getLowerMax();
  }

  getLowerHalfArray() {
    const dataArray = this.dataArray;
    if (dataArray) return dataArray.slice(0, dataArray.length / 2 - 1);
    else return [0.0];
  }

  getUpperHalfArray() {
    const dataArray = this.dataArray;
    if (dataArray)
      return dataArray.slice(dataArray.length / 2 - 1, dataArray.length - 1);
    else return [0.0];
  }
}

// Chuletilla===================================
// var lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
// var upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);

// var overallAvg = avg(dataArray);
// var lowerMax = max(lowerHalfArray);
// var lowerAvg = avg(lowerHalfArray);
// var upperMax = max(upperHalfArray);
// var upperAvg = avg(upperHalfArray);

// var lowerMaxFr = lowerMax / lowerHalfArray.length;
// var lowerAvgFr = lowerAvg / lowerHalfArray.length;
// var upperMaxFr = upperMax / upperHalfArray.length;
// var upperAvgFr = upperAvg / upperHalfArray.length;

// makeRoughGround(plane, modulate(upperAvgFr, 0, 1, 0.5, 4));
// makeRoughGround(plane2, modulate(lowerMaxFr, 0, 1, 0.5, 4));
