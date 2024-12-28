import {Vector} from "./vector.ts";

export class EditableImage {
    
    #byteArray: Uint8ClampedArray = new Uint8ClampedArray([]);
    #imageData?: ImageData; 

    public async loadImage(url: string): Promise<boolean> {
        
        return new Promise((resolve, reject) => {
            let tempImgElement = new Image();
            tempImgElement.src = url;
            tempImgElement.onload = () => {
                let tempCanvas = new OffscreenCanvas(tempImgElement.naturalWidth, tempImgElement.naturalHeight);

                let tempCtx = tempCanvas.getContext("2d");
                if(!tempCtx) {
                    reject(new Error("Failed to get temporary canvas context."));
                    return;
                }
                tempCtx.drawImage(tempImgElement, 0, 0);
                this.#imageData = tempCtx!.getImageData(0,0,tempImgElement.naturalWidth, tempImgElement.naturalHeight);
                this.#byteArray = this.#imageData.data;
                
                resolve(true);
            }
            
            tempImgElement.onerror = () => {
                reject(new Error("Failed to load the image."));
            }
            
            
        });
    }

    #rebuildImageDataObject(){
        if(!this.#imageData) return;
        this.#imageData = new ImageData(this.#byteArray, this.#imageData.width, this.#imageData.height);
    } 
    
    get byteArray(): Uint8ClampedArray {
        return this.#byteArray;
    }
    set dataArray(imageData: Uint8ClampedArray) {
        this.#byteArray = imageData;
        //Need to rebuild after changing properties
        this.#rebuildImageDataObject();
    }
    get width(): number {
        return this.#imageData?.width ?? 0;
    }
    get height(): number {
        return this.#imageData?.height ?? 0; 
    }
    get imageData(): ImageData | undefined{
        return this.#imageData;
    }
}
