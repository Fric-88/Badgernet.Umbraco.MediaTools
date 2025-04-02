import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
    LitElement,
    html,
    css,
    customElement,
    query,
    TemplateResult,
    state,
    property,
    ifDefined
} from "@umbraco-cms/backoffice/external/lit";
import { UUIModalContainerElement, UUIModalDialogElement } from "@umbraco-cms/backoffice/external/uui";
import MediatoolsContext, {MEDIA_TOOLS_CONTEXT_TOKEN} from "../context/mediatools.context.ts";
import {GetMetadataData, GetMetadataResponse, ImageMediaDto} from "../api";
import LoadingPopup from "./imageEditor/loadingPopup.ts";
import "./imageEditor/loadingPopup.ts";



type currentPage = "EXIF"|"IPTC"|"XMP";

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
    @state() currentPage: currentPage = "EXIF"; 
    @query("#previewContainer") container!: UUIModalContainerElement;
    @query("#dialogElement") dialog!: UUIModalDialogElement;
    @query("#loadingPopup") loadingPopup!: LoadingPopup;
    
    constructor() {
        super();
        this.consumeContext(MEDIA_TOOLS_CONTEXT_TOKEN,(_context) =>{
            this.#context = _context;
        });
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.currentPage = "EXIF";
    }

    public async showPreview(imageId: number, showMetadataFirst: boolean = false){
        if(!this.#context) return;

        const loadingPopup = this.loadingPopup as LoadingPopup;
        loadingPopup.openPopup("Loading preview...");
        
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

        await this.#loadMetadata(imageId).catch((e) => {console.log(e)}).then(() =>
            loadingPopup.closePopup()
        );
        
        if(showMetadataFirst){
            this.#renderMetadataPreview();
        }
        else{
            this.#renderImagePreview();
        }
    }
    
    #closePreview(){
        const dialog = this.dialog as UUIModalDialogElement;
        dialog.close(); 
        this.dialogTemplate = html``;
        this.currentPage = "EXIF";
    }
    
    async #loadMetadata(imageId:number){
        let request: GetMetadataData = {id: imageId };
        const response = await this.#context?.getMediaMetadata(request);

        if(response && !response.error){
            this.imageMetaData = response.data as GetMetadataResponse;
        }
    }
    
    #renderImagePreview(){
        this.currentPage = "EXIF"; //Reset paging when leaving metadata view
        this.dialogTemplate = html`
            <uui-modal-dialog id="dialogElement">
                <uui-dialog-layout class="layout" headline="Preview">
                    
                    <div class="imageContainer" style="width: ${this.renderWidth?.toFixed(0)}px; height: ${this.renderHeight?.toFixed(0)}px">
                        <img src="${this.imageInfo?.path}?width=${this.renderWidth?.toFixed(0)}&height=${this.renderHeight?.toFixed(0)}"
                             alt="${ifDefined(this.imageInfo?.name)}" onload="this.classList.add('loaded')">
                    </div>

                    
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
    
    #changePage(page: currentPage){
        this.currentPage = page;
        this.#renderMetadataPreview();
    }

    #renderMetadataPreview(){
        this.dialogTemplate = html`
            <uui-modal-dialog id="dialogElement">
                <uui-dialog-layout class="layout" headline="Metadata">

                    <div style="display: flex;">
                        <uui-tab-group style="">
                            <uui-tab label="exif" active="" @click="${() => this.#changePage('EXIF')}">EXIF</uui-tab>
                            <uui-tab label="iptc" @click="${() => this.#changePage('IPTC')}">IPTC</uui-tab>
                            <uui-tab label="xmp" @click="${() => this.#changePage('XMP')}">XMP</uui-tab>
                        </uui-tab-group>
                    </div>

                    <div class="metadataList" style="width: ${this.maxWidth}px; height: ${this.maxHeight}px;">
                        ${this.#renderPage()}
                    </div>
                    
                    <div class="buttonsBar">
                        <uui-button slot="actions" label="Metadata"
                                    look="primary" color="default"
                                    @click="${this.#renderImagePreview}">Preview
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
    
    #renderPage(){
        switch (this.currentPage) {
            case "EXIF":
                return html`
                    <uui-table style="padding: 2px; width: 99%;">
        
                        <uui-table-column style="width: 48%;"></uui-table-column>
                        <uui-table-column style="width: 48%;"></uui-table-column>
        
                        <uui-table-head>
                            <uui-table-head-cell>EXIF Tag</uui-table-head-cell>
                            <uui-table-head-cell>Value</uui-table-head-cell>
                        </uui-table-head>
        
        
                        ${this.imageMetaData?.exifTags?.length ?
                            this.imageMetaData.exifTags.map((e) =>
                                html`
                                    <uui-table-row>
                                        <uui-table-cell>${e.tag}</uui-table-cell>
                                        <uui-table-cell>${e.value}</uui-table-cell>
                                    </uui-table-row>
                                `):
                            html`<p>No metadata available</p>`
                        }
                    </uui-table>
                `;
            case "IPTC":
                return html`
                    <uui-table style="padding: 2px; width: 99%;">

                        <uui-table-column style="width: 48%;"></uui-table-column>
                        <uui-table-column style="width: 48%;"></uui-table-column>

                        <uui-table-head>
                            <uui-table-head-cell>IPTC Tag</uui-table-head-cell>
                            <uui-table-head-cell>Value</uui-table-head-cell>
                        </uui-table-head>


                        ${this.imageMetaData?.iptcTags?.length ?
                            this.imageMetaData.iptcTags.map((e) =>
                                    html`
                                <uui-table-row>
                                    <uui-table-cell>${e.tag}</uui-table-cell>
                                    <uui-table-cell>${e.value}</uui-table-cell>
                                </uui-table-row>
                            `):
                            html`<p>No metadata available</p>`
                        }
                    </uui-table>
                `;
            case "XMP":
                return html`<pre>${this.imageMetaData?.xmpProfile}</pre>`
        }
    }

    render() {
        return html`
            <uui-modal-container id="previewContainer" >
                ${this.dialogTemplate}
            </uui-modal-container>
            <loading-popup id="loadingPopup"></loading-popup>
        `
    }

    static styles = css`
        
        .layout{
            display: flex;
            flex-direction: column;
            gap: 0.5rem
        }
        
        .imageContainer {
            display: block;
            background-color: #e9eeff;
        }

        .image-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }

        .image-container img.loaded {
            opacity: 1;
        }
        
        .metadataList {
            overflow-y: scroll;
        }
        
        .imageContainer img{
            -webkit-box-shadow: 0 0 10px 4px rgba(0,0,0,0.15);
            box-shadow: 0 0 10px 4px rgba(0,0,0,0.15);
        }

        uui-table{
            border:1px #D8D7D9 solid;
            margin-bottom:1rem;
        }

        uui-table-head{
            background-color: #F4F3F5;
            border-radius: 3px;
            overflow: hidden;
        }

        uui-table-cell{
            padding: 0.3rem;
        }

        pre {
            background: #f4f4f4;
            padding: 10px;
            white-space: pre-wrap;
            font-family: monospace;
            font-size: 10px;
            border: 1px solid #ddd;
            overflow: auto;
        }
    `
}

export default ImagePreview;

declare global {
    interface HtmlElementTagNameMap {
        'image-preview': ImagePreview
    }
}

