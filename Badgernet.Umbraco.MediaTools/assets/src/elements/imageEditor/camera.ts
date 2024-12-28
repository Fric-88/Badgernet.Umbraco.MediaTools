import {Vector} from "./vector.ts";


const MAX_ZOOM: number = 5;
const MIN_ZOOM: number = 0.1;
const ZOOM_SENSITIVITY: number = 0.0005;

export class Camera{
    
    #offset: Vector = new Vector(0, 0);
    #zoom: number = 1;
    #normalizedZoom: number = 1; 
    #previousZoom: number = 1;
    public canZoom:boolean = true;
    public canMove:boolean = true;

    get offset(): Vector{
        return this.#offset;
    } 
    get nOffset():Vector{
        return this.normalizeVector(this.#offset);
    }
    get zoom(): number{
        return this.#zoom;
    }
    
    set zoom(value:number){
        this.#zoom = value;
    }
    public normalize(value:number):number{
       return value * this.#normalizedZoom;
    }
     
    //Returns normalized vector to keep visual size intact
    public normalizeVector(vector: Vector): Vector{
        return new Vector(vector.x * this.#normalizedZoom, vector.y * this.#normalizedZoom); 
    }

    public adjustZoom = (zoomAmount: number | null, zoomFactor: number | null) =>
    {
        if(!this.canZoom) return;
        
        if (zoomAmount)
        {
            zoomAmount = zoomAmount*ZOOM_SENSITIVITY; 
            this.#zoom += zoomAmount;
        }
        else if (zoomFactor)
        {
            console.log(zoomFactor);
            this.#zoom = zoomFactor * this.#previousZoom;
        }

        this.#zoom = Math.min( this.#zoom, MAX_ZOOM );
        this.#zoom = Math.max( this.#zoom, MIN_ZOOM );
        
        this.#normalizedZoom = 1 / this.#zoom;
    }
    
    public adjustOffset(x: number, y:number): void{
        
        if(!this.canMove) return; 
        
        this.offset.x = x;
        this.offset.y = y;
    }
}
    