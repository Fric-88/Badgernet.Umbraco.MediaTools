export default function init(
    options?: { locateFile?: (path: string) => string }
): Promise<{
    _malloc(size: number): number;
    _free(ptr: number): void;
    _manipulateImageData(
        ptr: number,
        len: number,
        red: number,
        green: number,
        blue: number,
        brightness: number,
        contrast: number,
        exposure: number
    ): void;
    HEAPU8: Uint8Array;
}>;
