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
    @property({attribute: true, type: Number }) maxWidth: number = 800;
    @property({attribute: true, type: Number }) maxHeight: number = 700;
    @state() imageMetaData? : GetMetadataResponse;
    @state() imageInfo?: ImageMediaDto;
    
    @state() renderWidth? : number = this.maxWidth;
    @state() renderHeight? : number = this.maxHeight;

    @state() dialogTemplate!: TemplateResult;
    @query("#previewContainer") container!: UUIModalContainerElement;
    @query("#dialogElement") dialog!: UUIModalDialogElement;
    
    constructor() {
        super();
        this.consumeContext(MEDIA_TOOLS_CONTEXT_TOKEN,(_context) =>{
            this.#context = _context;
        });
    }

    public async showPreview(imageId: number, showMetadataFirst: boolean = false){
        if(!this.#context) return;
        
        const imgInfoResponse = await this.#context.getMediaInfo({mediaId: imageId});
        if(!imgInfoResponse.data) return;
        this.imageInfo = imgInfoResponse.data;

        const scaleWidth = this.maxWidth / this.imageInfo.width;
        const scaleHeight = this.maxHeight / this.imageInfo.height;
        let scale: number = 0;

        if (scaleWidth < scaleHeight)
            scale = scaleWidth;
        else
            scale = scaleHeight;

        this.renderWidth = (this.imageInfo.width * scale);
        this.renderHeight = (this.imageInfo.height * scale);
       
        await this.#loadMetadata(imageId).catch((e) => {console.log(e)});
        
        if(showMetadataFirst)
            this.#renderMetadataPreview();
        else
            this.#renderPreviewTemplate();
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
    
    #renderPreviewTemplate(){
        this.dialogTemplate = html`
            <uui-modal-dialog id="dialogElement">
                <uui-dialog-layout class="layout" headline="Preview">
                    
                    <img src="${this.imageInfo?.path}?width=${this.renderWidth?.toFixed(0)}&height=${this.renderHeight?.toFixed(0)}" 
                         alt="${this.imageInfo?.name}">
                    
                    <uui-box>
                        <uui-label style="display: block">Path: <strong>${this.imageInfo?.path}</strong></uui-label>
                        <uui-label style="display: block">Name: <strong>${this.imageInfo?.name}</strong></uui-label>
                        <uui-label style="display: block">Resolution: <strong>${this.imageInfo?.width} x ${this.imageInfo?.height}</strong></uui-label>
                        <uui-label style="display: block">Disk size: <strong>${ this.imageInfo?.size}</strong></uui-label>
                        <uui-label style="display: block">Format: <strong>${this.imageInfo?.extension}</strong></uui-label>
                    </uui-box>
    
                    
                    <div class="buttonsBar">
                        <uui-button slot="actions" label="Metadata"
                                    look="primary" color="default"
                                    @click="${this.#renderMetadataPreview}">Metadata
                        </uui-button>
    
                        <uui-button slot="actions" label="Close"
                                    look="primary" color="default"
                                    @click="${this.#closePreview}">Close
                        </uui-button>
                    </div>
                    
                </uui-dialog-layout>
            </uui-modal-dialog>
        `
    }
    
    #renderMetadataPreview(){
        this.dialogTemplate = html`
            <uui-modal-dialog id="dialogElement">
                <div class="layout">
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

                    <uui-button slot="actions" label="Metadata"
                                look="primary" color="default"
                                @click="${this.#renderPreviewTemplate}">Preview
                    </uui-button>

                    <uui-button slot="actions" label="Close"
                                look="primary" color="default"
                                @click="${this.#closePreview}">Close
                    </uui-button>

                </div>

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
            gap: 0.5rem
        }
        
        .imageContainer {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .imageContainer img{
            -webkit-box-shadow: 0 0 10px 4px rgba(0,0,0,0.15);
            box-shadow: 0 0 10px 4px rgba(0,0,0,0.15);
        }

    `
}

export default ImagePreview;

declare global {
    interface HtmlElementTagNameMap {
        'image-preview': ImagePreview
    }
}

