import {Point, subtractPoints} from "./point.ts";

export class Mouse{
    #pointerLocation: Point;
    #oldPointerLocation: Point;
    #isDragging: boolean;
    #canvasElement?: HTMLCanvasElement;
    #mouseDragCallback?: (moveAmount: Point) => void;
    #mouseDownCallback?: (pointerLocation: Point) => void;
    #mouseUpCallback?: () => void;
    
    constructor() {
        this.#pointerLocation = {x: 0, y: 0};
        this.#oldPointerLocation = {x: 0, y: 0};
        this.#isDragging = false;
    }
    
    set mouseDragCallback(func: (moveAmount: Point) => void) {
        this.#mouseDragCallback = func;
    }
    set mouseDownCallback(func: (pointerLocation: Point) => void) {
        this.#mouseDownCallback = func;
    }
    set mouseUpCallback(func: () => void) {
        this.#mouseUpCallback = func;
    }

    #mouseDown(event: MouseEvent): void {
        this.#isDragging = true;
        this.#pointerLocation = this.#getPointerLocation(event);
        this.#oldPointerLocation = this.#pointerLocation;

        if(this.#mouseDownCallback){
            this.#mouseDownCallback(this.#pointerLocation);
        }
    }

    #mouseUp(): void {
        this.#isDragging = false;

        if(this.#mouseUpCallback){
            this.#mouseUpCallback();
        }
    }

    #mouseMove(event: MouseEvent): void {
        if(!this.#canvasElement) return;

        if(this.#isDragging){

            this.#oldPointerLocation = this.#pointerLocation;
            this.#pointerLocation = this.#getPointerLocation(event);

            //Calculate move ammount
            const moveAmount = subtractPoints(this.#pointerLocation, this.#oldPointerLocation,);

            //Callback call
            if(this.#mouseDragCallback){
                this.#mouseDragCallback(moveAmount);
            }
        }
    }

    #getPointerLocation(event: MouseEvent): Point {
        if(!this.#canvasElement) return {x: 0, y: 0};

        //Get pointer location 
        const rect = this.#canvasElement.getBoundingClientRect();
        return  {x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    
    public registerListeners(canvasElement: HTMLCanvasElement ): void {
        if(canvasElement){
            this.#canvasElement = canvasElement;
            //add listeners
            this.#canvasElement?.addEventListener("mousedown", (event: MouseEvent) => this.#mouseDown(event));  
            this.#canvasElement?.addEventListener("mouseup", () => this.#mouseUp());  
            this.#canvasElement?.addEventListener("mousemove", (event: MouseEvent) => this.#mouseMove(event));
        }
    }
    
    public removeListeners(): void {
        if(this.#canvasElement) {
            //remove listeners
            this.#canvasElement?.removeEventListener("mousedown", (event: MouseEvent) => this.#mouseDown(event));
            this.#canvasElement?.removeEventListener("mouseup", () => this.#mouseUp);
            this.#canvasElement?.removeEventListener("mousemove", (event: MouseEvent) => this.#mouseMove(event));
        }
    }
    

    
}