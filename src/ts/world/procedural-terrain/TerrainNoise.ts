export class TerrainNoise {
  public heightAt(x: number, z: number): number {
    const broad = this.fractal(x * 0.004, z * 0.004, 5);
    const detail = this.fractal(x * 0.018 + 91, z * 0.018 - 47, 3);
    const ridges = 1 - Math.abs(this.fractal(x * 0.009 - 23, z * 0.009 + 61, 4) * 2 - 1);
    const rawHeight = (broad - 0.5) * 34 + (detail - 0.5) * 5;
    const mountainHeight = Math.pow(Math.max(0, ridges - 0.52), 1.5) * 74;

    return rawHeight + mountainHeight - this.baseOffset;
  }

  public static colorVariation(x: number, z: number): number {
    return TerrainNoise.valueNoise(x * 0.12, z * 0.12, 13);
  }

  private readonly baseOffset: number = this.rawHeightAtOrigin();

  private rawHeightAtOrigin(): number {
    const broad = this.fractal(0, 0, 5);
    const detail = this.fractal(91, -47, 3);
    const ridges = 1 - Math.abs(this.fractal(-23, 61, 4) * 2 - 1);
    return (
      (broad - 0.5) * 34 +
      (detail - 0.5) * 5 +
      Math.pow(Math.max(0, ridges - 0.52), 1.5) * 74
    );
  }

  private fractal(x: number, z: number, octaves: number): number {
    let amplitude = 0.5;
    let frequency = 1;
    let total = 0;
    let normalization = 0;

    for (let octave = 0; octave < octaves; octave++) {
      total += TerrainNoise.valueNoise(x * frequency, z * frequency, octave) * amplitude;
      normalization += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return total / normalization;
  }

  private static valueNoise(x: number, z: number, seed: number): number {
    const x0 = Math.floor(x);
    const z0 = Math.floor(z);
    const tx = TerrainNoise.smooth(x - x0);
    const tz = TerrainNoise.smooth(z - z0);
    const a = TerrainNoise.hash(x0, z0, seed);
    const b = TerrainNoise.hash(x0 + 1, z0, seed);
    const c = TerrainNoise.hash(x0, z0 + 1, seed);
    const d = TerrainNoise.hash(x0 + 1, z0 + 1, seed);
    const top = a + (b - a) * tx;
    const bottom = c + (d - c) * tx;

    return top + (bottom - top) * tz;
  }

  private static hash(x: number, z: number, seed: number): number {
    const value = Math.sin(x * 127.1 + z * 311.7 + seed * 74.7) * 43758.5453;
    return value - Math.floor(value);
  }

  private static smooth(value: number): number {
    return value * value * (3 - 2 * value);
  }
}
