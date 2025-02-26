import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, query, TemplateResult, state} from "@umbraco-cms/backoffice/external/lit";
import { UUIModalContainerElement, UUIModalDialogElement } from "@umbraco-cms/backoffice/external/uui";
import MediatoolsContext, {MEDIA_TOOLS_CONTEXT_TOKEN} from "../context/mediatools.context.ts";
import {GetMetadataData, GetMetadataResponse} from "../api";


@customElement('image-preview')
export class ImagePreview extends UmbElementMixin(LitElement) {

    #context?: MediatoolsContext; 
    @state() imageMetaData? : GetMetadataResponse;
    constructor() {
        super();
        this.consumeContext(MEDIA_TOOLS_CONTEXT_TOKEN,(_context) =>{
            this.#context = _context;
        });
    }
    
    @state() dialogTemplate!: TemplateResult;  
    @query("#previewContainer") container!: UUIModalContainerElement;
    @query("#innerDialog") dialog!: UUIModalDialogElement; 
    
    #closeDialog(){
        const dialog = this.dialog as UUIModalDialogElement;
        dialog.close(); 
        this.dialogTemplate = html``;
    }
    
    async #loadMetadata(imageId:number){
        let request: GetMetadataData = {id: imageId };
        const response = await this.#context?.getMediaMetadata(request);

        if(response && !response.error){
            this.imageMetaData = response.data as GetMetadataResponse;
        }
        
    }

    public async showPreview(headline: string, imageUrl: string, imageId: number){

        await this.#loadMetadata(imageId).catch((e) => {console.log(e)});
        
        this.dialogTemplate = html`
        <uui-modal-dialog id="innerDialog">
            
            <uui-dialog-layout headline="${headline}">
                <div class="container">
                    <img src="${imageUrl}?width=800" alt="${headline}" width="800">
                    <div class="metadataContainer">
                    
                    <ul>

                    ${this.imageMetaData?.exif?.length ? 
                            this.imageMetaData.exif.map((e) => 
                                    html`<li><strong>${e.item1}: </strong> ${e.item2}</li>`): 
                                    html`<p>No metadata available</p>`
                    }

                    </ul>
            
                    </div>
                </div>

                <uui-button slot="actions" label="Close"
                            look="primary" color="default" 
                            @click="${this.#closeDialog}">Close
                </uui-button>
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
        .container {
            display: flex;
            flex-direction: row;
            max-height: 800px;
        }
        .metadataContainer {
            width: 350px;
            overflow-y: auto;
        }


    `
}

export default ImagePreview;

declare global {
    interface HtmlElementTagNameMap {
        'image-preview': ImagePreview
    }
}

