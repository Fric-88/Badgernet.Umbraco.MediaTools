import {Vector} from "./vector.ts";
import {Camera} from "./camera.ts";

export class Mouse {

    #position: Vector = new Vector(0, 0);
    #isDragging: boolean = false
    #dragStart: Vector = new Vector(0, 0);
    #initialPinchDistance: number | null = null;
    #camera?: Camera;
    #canvas?: HTMLCanvasElement;
    
    constructor(camera: Camera, canvas: HTMLCanvasElement) {
        this.#camera = camera;
        this.#canvas = canvas;
    }
    
    public registerEventListeners(): void{
        if(this.#canvas === undefined) return;
        
        this.#canvas.addEventListener('mousedown', this.onPointerDown)
        this.#canvas.addEventListener('touchstart', (e) => this.handleTouch(e, this.onPointerDown))
        this.#canvas.addEventListener('mouseup', this.onPointerUp)
        this.#canvas.addEventListener('touchend',  (e) => this.handleTouch(e, this.onPointerUp))
        this.#canvas.addEventListener('mousemove', (e) => this.onPointerMove(e))
        this.#canvas.addEventListener('touchmove', (e) => this.handleTouch(e, this.onPointerMove))
        this.#canvas.addEventListener( 'wheel', (e) => this.#camera!.adjustZoom(e.deltaY, null))
    }  
    
    public unregisterEventListeners(): void{
        if(this.#canvas === undefined) return;
        
        this.#canvas.removeEventListener('mousedown', this.onPointerDown)
        this.#canvas.removeEventListener('touchstart', (e) => this.handleTouch(e, this.onPointerDown))
        this.#canvas.removeEventListener('mouseup', this.onPointerUp)
        this.#canvas.removeEventListener('touchend',  (e) => this.handleTouch(e, this.onPointerUp))
        this.#canvas.removeEventListener('mousemove', this.onPointerMove)
        this.#canvas.removeEventListener('touchmove', (e) => this.handleTouch(e, this.onPointerMove))
        this.#canvas.removeEventListener( 'wheel', (e) => this.#camera!.adjustZoom(e.deltaY, null))
    }
    
    get nPos():Vector{
        return this.#camera!.normalizeVector(this.#position);
    } 

    private getPointerLocation = (e: MouseEvent | TouchEvent) : Vector | undefined =>
    {
        if(e instanceof TouchEvent ){
            if (e.touches && e.touches.length == 1)
            {
                return new Vector(e.touches[0].clientX, e.touches[0].clientY);
            }
        }
        if(e instanceof MouseEvent){
            if (e.clientX && e.clientY)
            {
                return new Vector(e.clientX, e.clientY);
            }
        }
    }

    public onPointerMove = (e: MouseEvent | TouchEvent)=>
    {
        if(e instanceof MouseEvent){
            const rect = this.#canvas!.getBoundingClientRect(); // Get canvas position relative to the page
            this.#position.x = e.clientX - rect.left;
            this.#position.y = e.clientY - rect.top;
        }

        if (this.#isDragging)
        {
            const pointerLocation = this.getPointerLocation(e);
            if(pointerLocation){
                
                this.#camera!.adjustOffset(
                    pointerLocation.x - this.#dragStart.x,
                    pointerLocation.y - this.#dragStart.y,);
            }
        }
    }
    
    public onPointerDown = (e: MouseEvent | TouchEvent) : void =>
    {
        const pointerLocation = this.getPointerLocation(e);

        if(pointerLocation){
            this.#isDragging = true;
            this.#dragStart.x = pointerLocation.x/this.#camera!.zoom - this.#camera!.offset.x;
            this.#dragStart.y = pointerLocation.y/this.#camera!.zoom - this.#camera!.offset.y;
        }

    }

    public onPointerUp = () =>
    {
        this.#isDragging = false;
        this.#initialPinchDistance = null;
    }

    public handlePinch = (e: TouchEvent)=>
    {
        e.preventDefault()

        let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };

        // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
        let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2

        if (this.#initialPinchDistance == null)
        {
            this.#initialPinchDistance = currentDistance
        }
        else
        {
            this.#camera!.adjustZoom( null, currentDistance/this.#initialPinchDistance )
        }
    }


    public handleTouch = (e: TouchEvent, singleTouchHandler: ((e: TouchEvent) => void))=>
    {
        if ( e.touches.length == 1 )
        {
            singleTouchHandler(e)
        }
        else if (e.type == "touchmove" && e.touches.length == 2)//Two fingers
        {
            this.#isDragging = false
            this.handlePinch(e)
        }
    }




    
}