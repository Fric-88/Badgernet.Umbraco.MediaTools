import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {LitElement, html, css, customElement, query, state, property } from "@umbraco-cms/backoffice/external/lit";
import "./imageEditorToolsPanel.ts"
import {Canvas} from "./canvas.ts";
import ImageEditorTools, {SliderValues} from "./imageEditorToolsPanel.ts";
import MediaToolsContext, {MEDIA_TOOLS_CONTEXT_TOKEN} from "../../context/mediatools.context.ts";
import {ReplaceImageData} from "../../api";
import SaveImageDialog, {SavingMethod} from "./saveImageDialog.element.ts";
import "./saveImageDialog.element.ts"
import {UUIToastNotificationContainerElement, UUIToastNotificationElement} from "@umbraco-cms/backoffice/external/uui";
import LoadingPopup from "./loadingPopup.ts";
import "./loadingPopup.ts"
import {sleep} from "../../code/helperFunctions.ts";

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
    @query("#canvasToolsPanel") toolsElement!: ImageEditorTools;
    @query("#saveImageDialog") saveImageDialog!: SaveImageDialog;
    @query("#loadingPopup") loadingPopup!: LoadingPopup;
    
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
        
        const loadingPopup = this.loadingPopup as LoadingPopup;
        loadingPopup.openPopup("Loading image...");
        
        this.#canvas = new Canvas(this.canvasElement);
        this.resizeCanvas();
        
        //Load the image into canvas
        let loaded = await this.#canvas?.loadImage(this.imgPath);
        
        if(loaded){
            loadingPopup.closePopup();
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
    
    //Adjust values in underlying image array buffer
    #adjustArray(e: CustomEvent){
        const values = e.detail as SliderValues;
        this.#canvas?.manipulateArrayBuffer(values.red, values.green, values.blue, values.brightness, values.contrast, values.exposure);
    }
    
    //Present saving menu
    #openSaveMenu(){
       
        const saveDialog = this.saveImageDialog;
        
        if(saveDialog){
            saveDialog.openDialog();
        }  
    }

    //Send image back to the server
    async #replaceImage(e: CustomEvent){
      
        const loadingPopup = this.loadingPopup as LoadingPopup;
        loadingPopup.openPopup("Saving image...");
        
        if(this.imgId < 0) return; //Image id was not set
        const image = this.#canvas?.getImageData();
        if(!image) return; //No image data
        
        //Convert ImageData to Blob
        const pngBlob = await this.#canvas?.getBlobAsync("image/png");
        
        if(!pngBlob) return;
        
        const imgFile = new File([pngBlob], "editedImage.png", { type: "image/png" });
        
        const preferredExtension = e.detail as SavingMethod;
        
        const request: ReplaceImageData = {
            id: this.imgId,
            formData:  { imageFile: imgFile },
            saveAs: preferredExtension
        }
        let response =  await this.#mediaToolsContext?.replaceImage(request);

        loadingPopup.closePopup();
        
        if(response){
            let responseData = response.data;
            if(responseData){
                switch (responseData.status){
                    case "Success":
                        this.#showToastNotification("Success", responseData.message, "", "positive");
                        const event = new CustomEvent("update-list",{
                            bubbles: true,       
                            composed: true,
                            detail: this.imgId 
                        });
                        this.dispatchEvent(event);
                        
                        break;
                    case "Warning":
                        this.#showToastNotification("Warning", responseData.message, "", "warning");
                        break;
                    case "Error":
                        this.#showToastNotification("Error", responseData.message, "", "danger");
                        break;
                }
            }
        }
    }

    //Send image back to the server
    async #saveImage(e: CustomEvent){
        
        if(this.imgId < 0) return; //Image id was not set
        const image = this.#canvas?.getImageData();
        if(!image) return; //No image data

        //Convert ImageData to Blob
        const blob = new Blob([image.data.buffer], { type: 'application/octet-stream' });

        const preferredExtension = e.detail as SavingMethod;
        
        //TODO build and make request to server
    }

    #showToastNotification(headline: string , message: string, information: string, color: '' | 'default' | 'positive' | 'warning' | 'danger' = '') {
        const container = this.renderRoot.querySelector('#notificationContainer') as UUIToastNotificationContainerElement;
        const toast = document.createElement('uui-toast-notification') as UUIToastNotificationElement;
        toast.color = color;

        const toastLayout = document.createElement('uui-toast-notification-layout');
        toastLayout.headline = headline;
        toast.appendChild(toastLayout);

        if(message){
            const messageElement = document.createElement('p');
            messageElement.innerHTML = message;
            toastLayout.appendChild(messageElement);
        }

        if(information){
            const smallMessage = document.createElement('small');
            smallMessage.innerHTML = information;
            toastLayout.appendChild(smallMessage);
        }

        if (container) {
            container.appendChild(toast);
        }
    }

    render() {
        return html`
            <div id="editorContainer">
                <canvas id="canvasEditor"></canvas>
                <div id="toolbar">
                    <editor-tools-panel
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
                            @undo="${() => this.#canvas?.undoChanges()}"
                            @redo="${() => this.#canvas?.redoChanges()}"
                            @save-image="${this.#openSaveMenu}"
                            @exit-click="${this.dispatchCloseEditor}">
                    </editor-tools-panel>
                </div>
            </div>
            
            <loading-popup id="loadingPopup" ></loading-popup>
            
            <save-image-dialog id="saveImageDialog"
                               @save-image="${this.#saveImage}"
                               @replace-image ="${this.#replaceImage}">
            </save-image-dialog>

            <uui-toast-notification-container
                    id="notificationContainer"
                    auto-close="3000">
            </uui-toast-notification-container>
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

        #notificationContainer{
            display: block;
            align-items:start;
            position:absolute;
            left:0px;
            bottom: 50px;
            right:15px;
            height:auto;
        }
    `
}

export default CanvasImageEditor;

declare global {
    interface HtmlElementTagNameMap {
        'canvas-image-editor': CanvasImageEditor
    }
}

