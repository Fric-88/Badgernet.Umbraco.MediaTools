import {Point} from "./point.ts";

export class Camera{
    
    #offset: Point = new Point(0, 0);
    #zoom: number = 1;
    #previousZoom: number = 1;
    
    get offset(): Point{
        return this.#offset;
    } 
    set offset(value:Point){
        this.#offset = value;
    }
    get zoom(): number{
        return this.#zoom;
    }
    set zoom(value:number){
        this.#previousZoom = this.#zoom;
        this.#zoom = value;
    }
    get previousZoom() : number{
        return this.#previousZoom;
    }
    
    
    
    
    
}
    