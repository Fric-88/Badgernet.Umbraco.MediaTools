import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {LitElement, html, css, customElement, query, state, property } from "@umbraco-cms/backoffice/external/lit";
import "./canvas_tools_panel.element.ts"
import {Canvas} from "./canvas.ts";
import CanvasToolsPanel, {SliderValues} from "./canvas_tools_panel.element.ts";
import MediaToolsContext, {MEDIA_TOOLS_CONTEXT_TOKEN} from "../../context/mediatools.context.ts";
import {ReplaceImageData} from "../../api";
import SaveImageDialog from "./saveImageDialog.element.ts";

@customElement('canvas-image-editor')
export class CanvasImageEditor extends UmbElementMixin(LitElement) {

    #mediaToolsContext?: MediaToolsContext;
    #canvas?: Canvas;
    private exiting: boolean = false;

    @property({attribute: true, type: Number}) width: number = 600;
    @property({attribute: true, type: Number}) height: number = 400;
    @property({attribute: true, type: Number}) minWidth: number = 400;
    @property({attribute: true, type: Number}) minHeight: number = 300;
    @property({attribute: true, type: String}) imgPath: string = "";
    @property({attribute: true, type: String}) imgId: number = -1;

    @query("#canvasEditor") canvasElement!: HTMLCanvasElement;
    @query("#canvasToolsPanel") toolsElement!: CanvasToolsPanel;
    @query("#saveImageDialog") saveImageDialog!: SaveImageDialog;
    
    constructor() {
        super();
        this.consumeContext(MEDIA_TOOLS_CONTEXT_TOKEN,(_context) => {
            this.#mediaToolsContext = _context;
        });
    }
    
    async connectedCallback() {
        super.connectedCallback();
        
        //Wait until DOM renders
        await this.updateComplete;
        
        this.#canvas = new Canvas(this.canvasElement);
        this.resizeCanvas();
        
        let loaded = await this.#canvas?.loadImage(this.imgPath);
        
        if(loaded){
            this.#canvas?.registerListeners();
            this.#canvas?.renderFrontCanvas();
        }

        window.addEventListener('resize', () => this.resizeCanvas()); 
    }
    
    disconnectedCallback() {
        super.disconnectedCallback();
        this.#canvas?.removeListeners();
        window.removeEventListener('resize',() => this.resizeCanvas());
    }

    //Resizing the canvas element when window size changes
    private resizeCanvas(){
        
        const dpr = window.devicePixelRatio || 1; 
        let targetWidth = (window.innerWidth - 200) * dpr;
        let targetHeight = (window.innerHeight - 250) * dpr;
        
        if(targetWidth < this.minWidth){
            targetWidth = this.minWidth;
        }
        
        if(targetHeight < this.minHeight){
            targetHeight = this.minHeight;
        }

        this.#canvas?.resizeCanvas(targetWidth, targetHeight);
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
    
    #adjustArray(e: CustomEvent){
        const values = e.detail as SliderValues;
        this.#canvas?.adjustArrayValues(values.red, values.green, values.blue, values.brightness, values.contrast, values.exposure);
    }
    
    //Present saving menu
    #openSaveMenu(){
        this.saveImageDialog.openDialog();
    }
    
    //Send image back to the server for it to be saved
    async #saveImage(){
        if(this.imgId < 0) return; //Image id was not set
        const image = this.#canvas?.getImageData();
        if(!image) return; //No image data
        
        // Convert ImageData to Blob
        const blob = new Blob([image.data.buffer], { type: 'application/octet-stream' });

        const request: ReplaceImageData = {
            id: this.imgId,
            formData:  { imageData: blob },
            width: image.width,
            height: image.height
        }
        let response =  await this.#mediaToolsContext?.replaceImage(request);
    }

    render() {
        return html`
            <div id="editorContainer">
                <canvas id="canvasEditor"></canvas>
                <div id="toolbar">
                    <canvas-tools-panel
                            id="canvasToolsPanel"
                            @enable-cropping="${() => this.#canvas?.enableCropOverlay()}"
                            @disable-cropping="${() => this.#canvas?.disableCropOverlay()}"
                            @apply-crop="${() => this.#canvas?.cropImage()}"
                            @discard-crop="${() => this.#canvas?.disableCropOverlay()}"
                            @flip-vertically="${() => this.#canvas?.flipVertically() }"
                            @flip-horizontally="${() => this.#canvas?.flipHorizontally() }"
                            @slider-values-change ="${this.#adjustArray}"
                            @apply-changes="${() => this.#canvas?.applyChanges()}"
                            @discard-changes="${() => this.#canvas?.discardChanges()}"
                            @rotate="${(e: CustomEvent) => this.#canvas?.rotateImage(e.detail as number)}" 
                            @undo="${() => this.#canvas?.undoChanges() }"
                            @redo="${() => this.#canvas?.redoChanges()}"
                            @save-image="${() => this.#openSaveMenu()}"
                            @exit-click="${this.dispatchCloseEditor}">
                    </canvas-tools-panel>
                </div>
            </div>
            
            <save-image-dialog id="saveImageDialog"></save-image-dialog>
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

