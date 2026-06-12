import initWasmModule from './manipulate.js';


let wasm: any;

export async function initWasm() {
    wasm = await initWasmModule();
    return wasm;
}

export function manipulateArrayBufferWasm(
    imageData: ImageData,
    red: number,
    green: number,
    blue: number,
    brightness: number,
    contrast: number,
    exposure: number
): void {
    if (!wasm) throw new Error("WASM module not initialized");

    const data = imageData.data;
    const len = data.length;

    const ptr = wasm._malloc(len);
    if (!ptr) throw new Error("WASM memory allocation failed");
    
    const heap = (wasm as any).HEAPU8;
    heap.set(data, ptr);
    
    wasm._manipulateImageData(ptr, len, red, green, blue, brightness, contrast, exposure);
    
    data.set(heap.subarray(ptr, ptr + len));

    wasm._free(ptr);
}