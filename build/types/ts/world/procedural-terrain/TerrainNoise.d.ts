export declare class TerrainNoise {
    heightAt(x: number, z: number): number;
    static colorVariation(x: number, z: number): number;
    private readonly baseOffset;
    private rawHeightAtOrigin;
    private fractal;
    private static valueNoise;
    private static hash;
    private static smooth;
}
