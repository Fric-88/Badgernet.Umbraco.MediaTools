import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, query, TemplateResult, state} from "@umbraco-cms/backoffice/external/lit";
import { UUIModalContainerElement, UUIModalDialogElement } from "@umbraco-cms/backoffice/external/uui";


@customElement('image-preview')
export class ImagePreview extends UmbElementMixin(LitElement) {

    constructor() {
        super();
    }
    @state() dialogTemplate!: TemplateResult;  
    @query("#previewContainer") container!: UUIModalContainerElement;
    @query("#innerDialog") dialog!: UUIModalDialogElement; 
    
    #closeDialog(){
        const dialog = this.dialog as UUIModalDialogElement;
        dialog.close(); 
        this.dialogTemplate = html``;
    }

    public showPreview(headline: string, imageUrl: string): void{
        
        this.dialogTemplate = html`
        <uui-modal-dialog id="innerDialog">
            <uui-dialog-layout headline="${headline}">
                
                <img src="${imageUrl}?width=800" alt="${headline}" width="800">

                <uui-button slot="actions" look="primary" color="default" @click="${this.#closeDialog}">Close</uui-button>

            </uui-dialog-layout>

        </uui-modal-dialog>
        `
    }

    render() {
        return html`
            <uui-modal-container id="previewContainer" >
                ${this.dialogTemplate}
            </uui-modal-container>
        `
    }

    static styles = css`



    `
}

export default ImagePreview;

declare global {
    interface HtmlElementTagNameMap {
        'image-preview': ImagePreview
    }
}

