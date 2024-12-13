import {Point} from "./point.ts";

export class CanvasImage{
    
    readonly image : HTMLImageElement;
    #position: Point = new Point();
    #size:Point = new Point();

    constructor(imagePath: string, onLoadCallback: () => void) {
        this.#position = new Point(0,0);
        this.image = new Image();
        this.image.src = imagePath;
        this.image.onload = () => {
            this.#size = new Point(this.image.width, this.image.height);
            onLoadCallback();
        }
    }
    get imageElement(): HTMLImageElement{
        return this.image;
    }
    
    set x(value: number){
        this.#position.x = value;
    }
    get x(): number{
        return this.#position.x;
    }
    set y(value: number) {
        this.#position.y = value;
    }
    get y():number{
        return this.#position.y;
    }
    set width(value:number){
        this.#size.x = value;
    }
    get width(): number{
        return this.#size.x;
    }
    set height(value: number) {
        this.#size.y = value;
    }
    get height(): number{
        return this.#size.y;
    }

    public scaledWidth(zoom: number){
        return this.width * (1 / zoom);
    }
    public scaledHeight(zoom: number){
        return this.height * (1 / zoom);
    }

    get corners(): Point[]{
        return [
            new Point(this.x, this.y),
            new Point(this.x + this.width, this.y),
            new Point(this.x + this.width, this.y + this.height),
            new Point(this.x, this.y + this.height)
        ] 
    }
    
    
}
