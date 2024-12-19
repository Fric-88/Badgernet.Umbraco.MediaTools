import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {LitElement, html, css, customElement, query, state, property } from "@umbraco-cms/backoffice/external/lit";
import {PropertyValues} from "lit";
import {Point} from "./point.ts";
import {CanvasImage} from "./canvas_image.ts";
import {Camera} from "./camera.ts";
import "./canvas_tools_panel.element.ts"


const MAX_ZOOM: number = 5;
const MIN_ZOOM: number = 0.1;
const SCROLL_SENSITIVITY: number = 0.0005;
type Tool = "Move" | "Pen";
let resizeTimeout: number = 0; 

@customElement('canvas-image-editor')
export class CanvasImageEditor extends UmbElementMixin(LitElement) {

    #selectedTool: Tool = "Move"; 
    
    private ctx?: CanvasRenderingContext2D;
    private image?: CanvasImage;

    private canvasWidth: number = 0;
    private canvasHeight: number = 0;
    private camera: Camera = new Camera();  
    private isDragging: boolean = false
    private dragStart: Point = new Point(0, 0);
    private initialPinchDistance: number | null = null;

    private exiting: boolean = false; 
    
    private get scaledCanvasWidth(){
        return this.canvasWidth * (1 / this.camera.zoom);
    }

    private get scaledCanvasHeight(){
        return this.canvasWidth * (1 / this.camera.zoom);
    }
    
    @property({attribute: true, type: Number}) width: number = 600;
    @property({attribute: true, type: Number}) height: number = 400;
    @property({attribute: true, type: String}) imgPath: string = "";

    @query("#canvasEditor") canvasElement!: HTMLCanvasElement;
    
    constructor() {
        super();
    }

    async connectedCallback() {
        super.connectedCallback();
        
        await this.updateComplete; 
        
        this.canvasElement.addEventListener('mousedown', this.onPointerDown)
        this.canvasElement.addEventListener('touchstart', (e) => this.handleTouch(e, this.onPointerDown))
        this.canvasElement.addEventListener('mouseup', this.onPointerUp)
        this.canvasElement.addEventListener('touchend',  (e) => this.handleTouch(e, this.onPointerUp))
        this.canvasElement.addEventListener('mousemove', this.onPointerMove)
        this.canvasElement.addEventListener('touchmove', (e) => this.handleTouch(e, this.onPointerMove))
        this.canvasElement.addEventListener( 'wheel', (e) => this.adjustZoom(e.deltaY*SCROLL_SENSITIVITY, null))

        window.addEventListener('resize', () => this.resizeCanvas()); 
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.canvasElement.removeEventListener('mousedown', this.onPointerDown)
        this.canvasElement.removeEventListener('touchstart', (e) => this.handleTouch(e, this.onPointerDown))
        this.canvasElement.removeEventListener('mouseup', this.onPointerUp)
        this.canvasElement.removeEventListener('touchend',  (e) => this.handleTouch(e, this.onPointerUp))
        this.canvasElement.removeEventListener('mousemove', this.onPointerMove)
        this.canvasElement.removeEventListener('touchmove', (e) => this.handleTouch(e, this.onPointerMove))
        this.canvasElement.removeEventListener( 'wheel', (e) => this.adjustZoom(e.deltaY*SCROLL_SENSITIVITY, null))
        
        window.removeEventListener('resize',() => this.resizeCanvas());
        
        this.exiting = true;
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        
        this.image = new CanvasImage(this.imgPath, () => {
            this.initializeCanvas();
        });
    }

    //Dispatch close editor event
    private dispatchCloseEditor(){
        
        this.exiting = true; 
        
        const event = new CustomEvent("close-editor",{
            detail: { message: 'Button clicked!' },
            bubbles: true,       // Allows the event to bubble up through the DOM
            composed: true       // Allows the event to pass through shadow DOM boundaries
        });
        this.dispatchEvent(event);
    }
    
    private initializeCanvas() {

        this.ctx = this.canvasElement.getContext("2d") as CanvasRenderingContext2D;
        if(this.ctx ===  undefined) return;
        
        //Set initial canvas size
        this.resizeCanvas();

        //Step into render loop
        this.renderCanvas();
    }
    
    private resizeCanvas(){
        
        //Set canvas size adapt to window size 
        const windowWidth = window.innerWidth - 500;
        const windowHeight = window.innerHeight - 250;
        const dpr: number = window.devicePixelRatio || 1;
        this.canvasElement.width = windowWidth * dpr;
        this.canvasElement.height = windowHeight * dpr;
        this.canvasWidth= this.canvasElement.width;
        this.canvasHeight= this.canvasElement.height;
        

        //Set zoom the image so it fits the canvas bounds
        if(this.image!.width > this.canvasWidth || this.image!.height > this.canvasHeight){
            const xZoom = (this.canvasWidth - 30) / this.image!.width;
            const yZoom = (this.canvasHeight - 30) / this.image!.height;
            
            if(xZoom <= yZoom){
                this.camera.zoom = xZoom;
            }
            else{
                this.camera.zoom = yZoom;
            } 
        }

    }
    
    //Rendering loop
    private renderCanvas = ()=>  {
        
        if(this.ctx === undefined) return;
        if(this.image === undefined) return;
        
        
        this.ctx.save();
        this.ctx.clearRect(0,0, this.canvasWidth, this.canvasHeight);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        
        //this.#renderGrid();
        
        this.ctx.translate(
            ((this.canvasWidth / 2) / this.camera.zoom) - this.image.width /2,
            ((this.canvasHeight / 2) / this.camera.zoom) - this.image.height /2
        );

        if(this.#selectedTool === "Move"){
            this.ctx.translate(this.camera.offset.x, this.camera.offset.y);
        }

        this.ctx.drawImage(
            this.image.imageElement, 0, 0
        );
        

        let imageCorners = this.image.corners;

        
        //Lines should not zoom  
        this.ctx.lineWidth = 1/this.camera.zoom;
       
        this.ctx.beginPath()
        this.ctx.moveTo(imageCorners[0].x, imageCorners[0].y);
        this.ctx.lineTo(imageCorners[1].x, imageCorners[1].y);
        this.ctx.lineTo(imageCorners[2].x, imageCorners[2].y);
        this.ctx.lineTo(imageCorners[3].x, imageCorners[3].y);
        this.ctx.lineTo(imageCorners[0].x, imageCorners[0].y);
        this.ctx.stroke();

        this.ctx.restore();
        
        if(!this.exiting)
        {
            window.requestAnimationFrame(this.renderCanvas); 
        }
    }

    private adjustZoom = (zoomAmount: number | null, zoomFactor: number | null) =>
    {

        if (!this.isDragging)
        {
            if (zoomAmount)
            {
                this.camera.zoom += zoomAmount;
            }
            else if (zoomFactor)
            {
                console.log(zoomFactor);
                this.camera.zoom = zoomFactor * this.camera.previousZoom;
            }

            this.camera.zoom = Math.min( this.camera.zoom, MAX_ZOOM );
            this.camera.zoom = Math.max( this.camera.zoom, MIN_ZOOM );
        }
    }

    private getPointerLocation = (e: MouseEvent | TouchEvent) : Point | undefined =>
    {
        if(e instanceof TouchEvent ){
            if (e.touches && e.touches.length == 1)
            {
                return new Point(e.touches[0].clientX, e.touches[0].clientY);
            }
        }
        if(e instanceof MouseEvent){
            if (e.clientX && e.clientY)
            {
                return new Point(e.clientX, e.clientY);
            }
        }
    }

    private onPointerDown = (e: MouseEvent | TouchEvent) : void =>
    {
        const pointerLocation = this.getPointerLocation(e);
        
        if(pointerLocation){
            this.isDragging = true;
            this.dragStart.x = pointerLocation.x/this.camera.zoom - this.camera.offset.x;
            this.dragStart.y = pointerLocation.y/this.camera.zoom - this.camera.offset.y;
        }

    }
    private onPointerUp = () =>
    {
        this.isDragging = false;
        this.initialPinchDistance = null;
        //this.lastZoom = this.cameraZoom;
    }
    private onPointerMove = (e: MouseEvent | TouchEvent)=>
    {
        if (this.isDragging)
        {
            const pointerLocation = this.getPointerLocation(e);
            if(pointerLocation){
                this.camera.offset.x = pointerLocation.x/this.camera.zoom - this.dragStart.x;
                this.camera.offset.y = pointerLocation.y/this.camera.zoom - this.dragStart.y;
            }

        }
    }

    private handlePinch = (e: TouchEvent)=>
    {
        e.preventDefault()

        let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };

        // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
        let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2

        if (this.initialPinchDistance == null)
        {
            this.initialPinchDistance = currentDistance
        }
        else
        {
            this.adjustZoom( null, currentDistance/this.initialPinchDistance )
        }
    }


    private handleTouch = (e: TouchEvent, singleTouchHandler: ((e: TouchEvent) => void))=>
    {
        if ( e.touches.length == 1 )
        {
            singleTouchHandler(e)
        }
        else if (e.type == "touchmove" && e.touches.length == 2)//Two fingers
        {
            this.isDragging = false
            this.handlePinch(e)
        }
    }

    render() {
        return html`
            <div id="editorContainer">
                
                <div id="toolbar">
                    <canvas-tools-panel></canvas-tools-panel>
                </div>
                <canvas id="canvasEditor"></canvas>
                

               
            </div>
        `
    }

    static styles = css`

        #editorContainer{
            display: flex;
            flex-direction: row;
            padding: 0;
            gap: 3px;
        }
        
        .flexRow{
            display: flex;
            flex-direction: row;
        }
        
        .flexColumn{
            display: flex;
            flex-direction: column;
        }
        
        #canvasEditor{
            background-color: whitesmoke;
            flex-grow: 1;
        }
        
        #toolbar{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
    `
}

export default CanvasImageEditor;

declare global {
    interface HtmlElementTagNameMap {
        'canvas-image-editor': CanvasImageEditor
    }
}

