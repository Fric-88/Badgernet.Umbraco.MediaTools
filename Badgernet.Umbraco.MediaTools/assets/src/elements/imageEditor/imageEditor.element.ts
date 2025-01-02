import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {LitElement, html, css, customElement, query, state, property } from "@umbraco-cms/backoffice/external/lit";
import {PropertyValues} from "lit";
import {ImageDataList} from "./imageDataList.ts";
import {Camera} from "./camera.ts";
import "./canvas_tools_panel.element.ts"
import {Mouse} from "./mouse.ts";
import {Canvas} from "./canvas.ts";
import CanvasToolsPanel from "./canvas_tools_panel.element.ts";

@customElement('canvas-image-editor')
export class CanvasImageEditor extends UmbElementMixin(LitElement) {

    
    #canvas?: Canvas; 

    private image: ImageDataList = new ImageDataList();
    private camera: Camera = new Camera();  
    private mouse?: Mouse;
    
    private exiting: boolean = false;

    @property({attribute: true, type: Number}) width: number = 600;
    @property({attribute: true, type: Number}) height: number = 400;
    @property({attribute: true, type: String}) imgPath: string = "";

    @query("#canvasEditor") canvasElement!: HTMLCanvasElement;
    @query("#canvasToolsPanel") toolsElement!: CanvasToolsPanel;
    
    constructor() {
        super();
        
        
    }
    async connectedCallback() {
        super.connectedCallback();
        
        //Wait until DOM renders
        await this.updateComplete; 
        
        this.resizeCanvas();
        
        this.#canvas = new Canvas(this.canvasElement);
        let loaded = await this.#canvas?.loadImage(this.imgPath);
        
        if(loaded){
            this.#canvas?.renderCanvas();
        }
        
        //Initialize mouse and register its events
        this.mouse = new Mouse(this.camera, this.canvasElement);
        this.mouse.registerEventListeners();

        window.addEventListener('resize', () => this.resizeCanvas()); 
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.mouse?.unregisterEventListeners();
        
        window.removeEventListener('resize',() => this.resizeCanvas());
    }
    protected async firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
    }
    
    private resizeCanvas(){
        //Set canvas size adapt to window size 
        const windowWidth = window.innerWidth - 300;
        const windowHeight = window.innerHeight - 250;
        const dpr: number = window.devicePixelRatio || 1;
        this.canvasElement.width = windowWidth * dpr;
        this.canvasElement.height = windowHeight * dpr;
        
        //Redraw canvas
        this.#canvas?.renderCanvas();
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
                <canvas id="canvasEditor"></canvas>
                <div id="toolbar">
                    <canvas-tools-panel
                            id="canvasToolsPanel"
                            @flip-vertically="${() => this.#canvas?.flipVertically() }"
                            @flip-horizontally="${() => this.#canvas?.flipHorizontally() }"
                            @adjust-brightness="${() => this.#canvas?.adjustBrightness(this.toolsElement.brightnessValue)}"
                            @undo="${() => this.#canvas?.undoChanges() }"
                            @redo="${() => this.#canvas?.redoChanges()}"
                            @exit-click="${this.dispatchCloseEditor}">
                    </canvas-tools-panel>
                </div>
            </div>
        `
    }
    
    static styles = css`

        #editorContainer {
            display: flex;
            flex-direction: column;
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
            flex-shrink: 1;
            border: 1px #d5d4d4 solid;
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

