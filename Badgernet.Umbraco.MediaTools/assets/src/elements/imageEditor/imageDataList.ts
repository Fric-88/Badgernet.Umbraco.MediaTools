import {Point} from "./point.ts";

export class ImageDataList {
    
    readonly #maxLenght: number = 25;  
    readonly #changesList: Array<ImageData>;
    #currentIndex: number;
    
    
    constructor(maxLenght?: number) {
        if(maxLenght){
            this.#maxLenght = maxLenght;
        }
        this.#changesList = new Array<ImageData>();
        this.#currentIndex = 0;
    }
    
    get length(): number {
        return this.#changesList.length;
    }
    
    get currentIndex(): number {
        return this.#currentIndex;
    }
    public addData(data: ImageData){

        if(this.#changesList.length - 1 > this.#currentIndex){
            this.#changesList.splice(this.#currentIndex + 1, Infinity);
        }
        
        this.#changesList.push(data);
        this.#currentIndex= this.#changesList.length-1;
        
        if(this.#changesList.length >  this.#maxLenght){
            this.#changesList.shift();
            this.#currentIndex--;
        }
    }  
    
    public goBack(){
        if(this.#currentIndex > 0){
            this.#currentIndex--;
        }
    }
    public goForward(){
        if(this.#currentIndex < this.#changesList.length - 1){
            this.#currentIndex++;
        }
    } 
    public getData():ImageData{
        return this.#changesList[this.#currentIndex];
    }
    public getCopy(): ImageData{
        return new ImageData(
            new Uint8ClampedArray(this.#changesList[this.#currentIndex].data),
            this.#changesList[this.#currentIndex].width,
            this.#changesList[this.#currentIndex].height
        );
    } 
    public isRotatedImage(data:ImageData): boolean{
        return data.width > this.#changesList[0].width || data.height > this.#changesList[0].height;
    }
}
