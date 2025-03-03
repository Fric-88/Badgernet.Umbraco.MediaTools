import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
    LitElement,
    html,
    css,
    customElement,
    query,
    TemplateResult,
    state,
    property
} from "@umbraco-cms/backoffice/external/lit";
import { UUIModalContainerElement, UUIModalDialogElement } from "@umbraco-cms/backoffice/external/uui";
import MediatoolsContext, {MEDIA_TOOLS_CONTEXT_TOKEN} from "../context/mediatools.context.ts";
import {GetMetadataData, GetMetadataResponse, ImageMediaDto} from "../api";


@customElement('image-preview')
export class ImagePreview extends UmbElementMixin(LitElement) {

    #context?: MediatoolsContext;
    @property({attribute: true, type: Number }) maxImageWidth: number = 450;
    @property({attribute: true, type: Number }) maxImageHeight: number = 450;
    @state() imageMetaData? : GetMetadataResponse;
    @state() imageInfo?: ImageMediaDto;
    
    @state() imageRenderWidth? : number = this.maxImageWidth;
    @state() imageRenderHeight? : number = this.maxImageHeight;

    @state() dialogTemplate!: TemplateResult;
    @query("#previewContainer") container!: UUIModalContainerElement;
    @query("#innerDialog") dialog!: UUIModalDialogElement;
    
    constructor() {
        super();
        this.consumeContext(MEDIA_TOOLS_CONTEXT_TOKEN,(_context) =>{
            this.#context = _context;
        });
    }

    public async showPreview(imageId: number){
        if(!this.#context) return;
        
        const imgInfoResponse = await this.#context.getMediaInfo({mediaId: imageId});
        if(!imgInfoResponse.data) return;
        this.imageInfo = imgInfoResponse.data;

        const scaleWidth = this.maxImageWidth / this.imageInfo.width;
        const scaleHeight = this.maxImageHeight / this.imageInfo.height;
        let scale: number = 0;

        if (scaleWidth < scaleHeight)
            scale = scaleWidth;
        else
            scale = scaleHeight;

        this.imageRenderWidth = (this.imageInfo.width * scale);
        this.imageRenderHeight = (this.imageInfo.height * scale);
       
        await this.#loadMetadata(imageId).catch((e) => {console.log(e)});
        this.#renderTemplate();
    }
    
    #closePreview(){
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
    
    #renderTemplate(){
        this.dialogTemplate = html`
        <uui-modal-dialog id="innerDialog">
            
            <uui-dialog-layout class="layout"">
                <div class="container">
                    <div class="metadataContainer">
                        
                        <div style="display: flex;">
                            <uui-tab-group style="">
                                <uui-tab label="exif" active="">EXIF</uui-tab>
                                <uui-tab label="iptc">IPTC</uui-tab>
                                <uui-tab label="xmp">XMP</uui-tab>
                            </uui-tab-group>
                        </div>
                        
                        <div class="metadataList">
                            <ul>
                                ${this.imageMetaData?.exifValues?.length ?
                                        this.imageMetaData.exifValues.map((e) =>
                                                html`<li><strong>${e.item1}: </strong> ${e.item2}</li>`):
                                        html`<p>No metadata available</p>`
                                }
                            </ul>
                        </div>

                    </div>
                    
                    <div class="imageContainer" style="min-width: ${this.maxImageWidth}px; min-height: ${this.maxImageHeight}px;">
                        <img src="${this.imageInfo?.path}?width=${this.imageRenderWidth?.toPrecision(1)}&height=${this.imageRenderHeight?.toPrecision(1)}" 
                             alt="${this.imageInfo?.name}">

                    </div>
                </div>

                <uui-button slot="actions" label="Close"
                            look="primary" color="default"
                            @click="${this.#closePreview}">Close
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
        
        .layout{
            display: flex;
            flex-direction: column;
        }
        
        .container {
            display: flex;
            flex-direction: row;
            max-height: 800px;
            gap: 0.5rem;
        }
        .imageContainer {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-top: 3rem;
        }
        
        .imageContainer img{
            -webkit-box-shadow: 0 0 10px 4px rgba(0,0,0,0.15);
            box-shadow: 0 0 10px 4px rgba(0,0,0,0.15);
        }
        
        .metadataContainer {
            width: 350px;
        }
        
        .metadataList {
            overflow-y: auto;
            height: 750px;
        }
    `
}

export default ImagePreview;

declare global {
    interface HtmlElementTagNameMap {
        'image-preview': ImagePreview
    }
}

