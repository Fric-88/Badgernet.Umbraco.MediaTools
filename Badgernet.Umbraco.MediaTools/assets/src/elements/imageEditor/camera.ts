import {Vector} from "./vector.ts";


const MAX_ZOOM: number = 5;
const MIN_ZOOM: number = 0.1;
const SCROLL_SENSITIVITY: number = 0.0005;

export class Camera{
    
    #offset: Vector = new Vector(0, 0);
    #zoom: number = 1;
    #previousZoom: number = 1;

    get offset(): Vector{
        return this.#offset;
    } 
    set offset(value:Vector){
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
     public normalize(value:number):number{
        return value *= (1/this.#zoom);
     }
     
    //Returns normalized vector to keep visual size intact
    public normalizeVector(vector: Vector): Vector{
        vector.x *= (1/this.#zoom);
        vector.y *= (1/this.#zoom);
        return vector; 
    }

    public adjustZoom = (zoomAmount: number | null, zoomFactor: number | null) =>
    {
        if (zoomAmount)
        {
            zoomAmount = zoomAmount*SCROLL_SENSITIVITY; 
            this.#zoom += zoomAmount;
        }
        else if (zoomFactor)
        {
            console.log(zoomFactor);
            this.#zoom = zoomFactor * this.#previousZoom;
        }

        this.#zoom = Math.min( this.#zoom, MAX_ZOOM );
        this.#zoom = Math.max( this.#zoom, MIN_ZOOM );
    }
}
    