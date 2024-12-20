import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {LitElement, html, css, customElement, query, state, property } from "@umbraco-cms/backoffice/external/lit";
import {PropertyValues} from "lit";
import {Vector} from "./vector.ts";
import {CanvasImage} from "./canvas_image.ts";
import {Camera} from "./camera.ts";
import "./canvas_tools_panel.element.ts"
import {Mouse} from "./mouse.ts";
import {ToolSelection} from "./canvas_tools_panel.element.ts";

@customElement('canvas-image-editor')
export class CanvasImageEditor extends UmbElementMixin(LitElement) {

    #selectedTool: ToolSelection = "move"; 
    
    private ctx?: CanvasRenderingContext2D;
    private image?: CanvasImage;
    private camera: Camera = new Camera();  
    private mouse?: Mouse;
    
    private exiting: boolean = false; 
    
    @property({attribute: true, type: Number}) width: number = 600;
    @property({attribute: true, type: Number}) height: number = 400;
    @property({attribute: true, type: String}) imgPath: string = "";

    @query("#canvasEditor") canvasElement!: HTMLCanvasElement;
    
    constructor() {
        super();
    }

    async connectedCallback() {
        super.connectedCallback();
        
        //Wait until DOM renders
        await this.updateComplete; 
        
        //Initialize mouse and register its events
        this.mouse = new Mouse(this.camera, this.canvasElement);
        this.mouse.registerEventListeners();

        window.addEventListener('resize', () => this.resizeCanvas()); 
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.mouse?.unregisterEventListeners();
        
        window.removeEventListener('resize',() => this.resizeCanvas());
        
        this.exiting = true;
    }
    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        
        //Load the image and initialize canvas when load finishes
        this.image = new CanvasImage(this.imgPath, () => {
            this.initializeCanvas();
        });
    }

    private initializeCanvas() {

        this.ctx = this.canvasElement.getContext("2d") as CanvasRenderingContext2D;
        if(this.ctx ===  undefined) return;
        
        //Set initial canvas size
        this.resizeCanvas();

        //Step into render loop
        this.renderCanvas();
    }
    
    //Rendering loop
    private renderCanvas = ()=>  {
        
        if(this.ctx === undefined) return;
        if(this.image === undefined) return;
        if(this.mouse === undefined) return;
        
        this.ctx.save();
        if(this.#selectedTool === "move" ){
            this.ctx.scale(this.camera.zoom, this.camera.zoom);
        }
        
        let nCanvasWidth = this.camera.normalize(this.canvasElement.width);
        let nCanvasHeight = this.camera.normalize(this.canvasElement.height);

        //Clear canvas 
        this.ctx.clearRect(0, 0, nCanvasWidth, nCanvasHeight);
        
        //Center image in the middle of the canvas
        this.image.x = (nCanvasWidth - this.image.width)/2;
        this.image.y = (nCanvasHeight - this.image.height)/2;

        //Adjust image position based on dragging  
        if(this.#selectedTool === "move"){
            this.image.x += this.camera.offset.x;
            this.image.y += this.camera.offset.y;
        }

        this.ctx.drawImage(
            this.image.imageElement, this.image.x, this.image.y,
        );
        
        //TODO OTHER DRAWING STUFF
        
        //Draw cursor
        this.ctx.beginPath();
        let cursorSize = this.camera.normalize(5); 
        this.ctx.arc(this.mouse.nPos.x, this.mouse.nPos.y, cursorSize, 0, 360);
        this.ctx.stroke();
        this.ctx.closePath();
 

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

    private resizeCanvas(){

        //Set canvas size adapt to window size 
        const windowWidth = window.innerWidth - 300;
        const windowHeight = window.innerHeight - 250;
        const dpr: number = window.devicePixelRatio || 1;
        this.canvasElement.width = windowWidth * dpr;
        this.canvasElement.height = windowHeight * dpr;

        //Set zoom the image so it fits the canvas bounds
        if(this.image!.width > this.canvasElement.width || this.image!.height > this.canvasElement.height){
            const xZoom = (this.canvasElement.width - 30) / this.image!.width;
            const yZoom = (this.canvasElement.height - 30) / this.image!.height;

            if(xZoom <= yZoom){
                this.camera.zoom = xZoom;
            }
            else{
                this.camera.zoom = yZoom;
            }
        }
    }

    //Dispatch close editor event
    private dispatchCloseEditor(){

        this.exiting = true;

        const event = new Event("close-editor",{
            bubbles: true,       // Allows the event to bubble up through the DOM
            composed: true       // Allows the event to pass through shadow DOM boundaries
        });
        this.dispatchEvent(event);
    }
    
    
    

    render() {
        return html`
            <div id="editorContainer">
                <div id="toolbar">
                    <canvas-tools-panel 
                            @move-selected="${()=> this.#changeTool("move")}" 
                            @draw-selected="${()=> this.#changeTool("draw")}"
                            @spray-selected="${()=> this.#changeTool("spray")}"
                            @rotate-selected="${()=> this.#changeTool("rotate")}"
                            @crop-selected="${()=> this.#changeTool("crop")}"
                            @adjust-selected="${()=> this.#changeTool("adjust")}"
                            @exit-click="${this.dispatchCloseEditor}">
                    </canvas-tools-panel>
                </div>
                <canvas id="canvasEditor"></canvas>
            </div>
        `
    }
    
    #changeTool(tool:ToolSelection){
        this.#selectedTool = tool;
        console.log(this.#selectedTool);
    }

    static styles = css`

        #editorContainer {
            display: flex;
            flex-direction: row;
            padding: 0;
            gap: 3px;
        }

        .flexRow {
            display: flex;
            flex-direction: row;
        }

        .flexColumn {
            display: flex;
            flex-direction: column;
        }

        #canvasEditor {
            background-color: whitesmoke;
            flex-grow: 1;
            border: 1px #d5d4d4 solid;
            cursor: none;
        }

        #toolbar {
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

