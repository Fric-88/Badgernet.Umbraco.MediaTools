import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, query, TemplateResult, state} from "@umbraco-cms/backoffice/external/lit";
import { UUIModalContainerElement, UUIModalDialogElement } from "@umbraco-cms/backoffice/external/uui";
import "../imageEditor/canvas_image_editor.element"
import CanvasImageEditor from "./canvas_image_editor.element.ts";



@customElement('image-editor-dialog')
export class ImageEditorDialog extends UmbElementMixin(LitElement) {
    constructor() {
        super();
    }
    @state() dialogTemplate!: TemplateResult;
    @query("#dialogContainer") container!: UUIModalContainerElement;
    @query("#innerDialog") dialog!: UUIModalDialogElement;

    #okButtonText: string = "Ok";
    #cancelButtonText: string = "Cancel";
    #okFunction: (() => void) | undefined;
    #cancelFunction: (() => void) | undefined;

    #closeDialog(){
        const dialog = this.dialog as UUIModalDialogElement;
        dialog.close();
        this.dialogTemplate = html``;
    }
    #okAction(){

        this.#closeDialog();

        if(this.#okFunction){
            this.#okFunction(); //Run the job if defined
        }
    }
    #cancelAction(){
        this.#closeDialog();

        if(this.#cancelFunction){
            this.#cancelFunction(); //Run the job if defined
        }
    }
    
    #handleCloseEvent(e: Event){
        if(e.target instanceof CanvasImageEditor){
            this.#closeDialog();
        }
    }

    public openEditor(width: number, height: number, imagePath: string, cancelButtonText?: string, okFunc?: () => void, cancelFunc?: () => void): void{
        this.#okFunction = okFunc;
        this.#cancelFunction = cancelFunc;

        if(cancelButtonText !== undefined){
            this.#cancelButtonText = cancelButtonText;
        }

        this.dialogTemplate = html`
            <uui-modal-dialog id="innerDialog">
    
                <uui-dialog-layout>
                    
                    <div id="canvasContainer">
                        <canvas-image-editor width="${width}" 
                                             height="${height}" 
                                             imgPath="${imagePath}" 
                                             @close-editor="${this.#handleCloseEvent}">
                            
                        </canvas-image-editor>
                    </div>
                </uui-dialog-layout>
    
            </uui-modal-dialog>
        `
    }

    render() {
        return html`
            <uui-modal-container id="dialogContainer" >
                ${this.dialogTemplate}
            </uui-modal-container>
        `
    }

    static styles = css`
        #canvasContainer{
            display: block;
            overflow: hidden;
        }
    `
}

export default ImageEditorDialog;

declare global {
    interface HtmlElementTagNameMap {
        'image-editor-dialog': ImageEditorDialog
    }
}

