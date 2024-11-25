import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, state, query } from "@umbraco-cms/backoffice/external/lit";
import MediaToolsContext, { MEDIA_TOOLS_CONTEXT_TOKEN } from "../context/mediatools.context";
import {
    UUICheckboxElement,
    UUIInputElement,
    UUIPaginationElement,
    UUITableCellElement,
    UUITableRowElement,
    UUIToastNotificationContainerElement,
    UUIToastNotificationElement
} from "@umbraco-cms/backoffice/external/uui";
import {FilterGalleryData, ImageMediaDto, OperationResponse, ProcessImagesData, RenameMediaData} from "../api";
import { SelectablePagedList } from "../code/pagedList";
import "../elements/process_image_panel.element";
import ProcessImagePanel, { ProcessingSettings } from "../elements/process_image_panel.element";
import ImagePreview from "../elements/image_preview.element";
import "../elements/image_preview.element"
import ImageSearchBar from "../elements/image_search_bar.element";
import "../elements/image_search_bar.element"
import RenameMediaDialog from "../elements/rename_media_dialog.element.ts";  
import "../elements/rename_media_dialog.element" 

@customElement('badgernet_umbraco_mediatools-gallery-worker-dash')
export class GalleryWorkerDashboard extends UmbElementMixin(LitElement) {

    #mediaToolsContext?: MediaToolsContext;

    @state() width: number = 1;
    @state() height: number = 1;

    @state() currentPage: number = 1;
    @state() itemsList: SelectablePagedList<ImageMediaDto> = new SelectablePagedList<ImageMediaDto>(10);
    @state() allSelected: boolean = false;

    @query("#imagePreviewElement") previewModal!: ImagePreview;
    @query("#renameMediaDialog") renameMediaDialog!: RenameMediaDialog;

    constructor() {
        super();

        this.consumeContext(MEDIA_TOOLS_CONTEXT_TOKEN,(_context) =>{
            this.#mediaToolsContext = _context;

            this.observe(_context.targetWidth, (_value) => { this.width = _value; } ); 
            this.observe(_context.targetHeight, (_value) => { this.height = _value} ); 

        });
    }

    connectedCallback(): void {
        super.connectedCallback();
    }

    private itemRowClicked(e: Event){
        const target = e.target;

        if(target instanceof UUITableCellElement){

            let row = target.parentElement as UUITableRowElement;
            let itemIndex = Number(row.dataset.imageRow);
            let item: ImageMediaDto | undefined = this.itemsList.itemAt(itemIndex);

            if(item === undefined) return; //Item not found

            if(this.itemsList.isSelected(item)){
                this.itemsList.unselect(item);
                this.allSelected = false;
            }
            else{
                this.itemsList.select(item);
                if(this.itemsList.count() === this.itemsList.countSelectedItems()){
                    this.allSelected = true;
                }
            }
            this.requestUpdate();
        }
    }

    private changePage(e: Event){
        const target = e.target;
        if(target instanceof UUIPaginationElement){
            this.currentPage = target.current;
        }
    }

    private async searchGallery(e: CustomEvent){
        let target = e.target;

        if(target instanceof ImageSearchBar){

            target.findButtonState = "waiting"; //Loading button look

            this.itemsList.clear();
            this.allSelected = false;

            try{

                const requestData = e.detail as FilterGalleryData;
                const response = await this.#mediaToolsContext?.filterGallery(requestData);

                if(response?.data){
                    this.itemsList.fromArray(response.data);
                    this.requestUpdate();
                }

                target.findButtonState = undefined;//Normal button look
            }
            catch(error){
                this.#showToastNotification("Oops!","Something went wrong", "", "danger");
            }
        }
    }

    private toggleSelectAll(e: Event){
        let target = e.target;

        if(target instanceof UUICheckboxElement){
            let isSelected = this.itemsList.count() == this.itemsList.countSelectedItems();

            if(isSelected){
                this.itemsList.unselectAll();
                this.allSelected = false;
            }
            else{
                this.itemsList.selectAll();
                this.allSelected = true;
            }
            this.requestUpdate();
        }

    }
    
    private async renameMedia(e: Event){
        
        if(e.target instanceof ProcessImagePanel){
            const dialog = this.renameMediaDialog as RenameMediaDialog;
            
            //Exactly one element has to be selected
            if(this.itemsList.countSelectedItems() !== 1) return;
            
            let selectedImage = this.itemsList.getSelectedItems()[0];
            
            if(selectedImage == undefined) return;
            
            if(dialog){
                dialog.showModal(selectedImage.name, async () => {
                    
                    const requestData: RenameMediaData = {
                        mediaId: selectedImage.id,
                        newName: dialog.mediaName
                    }
                    
                    const response = await this.#mediaToolsContext?.renameMedia(requestData);
                    if(response){
                        const operationResponse = response.data as OperationResponse;
                        if(operationResponse){
                            if(operationResponse.status === "Success"){
                                this.#showToastNotification("Done",operationResponse.message, "","positive");
                                selectedImage.name = dialog.mediaName;
                                this.requestUpdate();
                            }
                        }
                    }    
                });
            }
        }
    }

    private async processSelectedImages(e: CustomEvent<ProcessingSettings>){
        let target = e.target;
        
        if(target instanceof ProcessImagePanel){
            let settings = e.detail as ProcessingSettings;

            if(this.itemsList.countSelectedItems() < 1){
                this.#showToastNotification("Oops!", "You need to select some images first.", "", "warning");
                return;
            }

            //Set buttons styles 
            target.processButtonState = "waiting";
            target.trashButtonEnabled = false;
            target.downloadButtonEnabled = false;

            let requestData: ProcessImagesData = {
                requestBody: {
                    ids: this.itemsList.getSelectedItems().map((item) => item.id),
                    resize: settings.resize,
                    resizeMode: settings.resizeMode,
                    width: settings.width,
                    height: settings.height,
                    convert: settings.convert,
                    convertMode: settings.convertMode,
                    convertQuality: settings.convertQuality
                }
            }

            try{
                const response = await this.#mediaToolsContext?.processImage(requestData);

                if(response){
                    const operationResponse = response.data;
                    
                    if(operationResponse){
                        if(operationResponse.status === "Warning"){
                            this.#showToastNotification("Done", operationResponse.message, "Check logs for more information.", "warning");
                        }
                        else if(operationResponse.status === "Success") {
                            this.#showToastNotification("Done",operationResponse.message, "", "positive");
                        }
                        else{
                            this.#showToastNotification("Oops", "Something went wrong", "Check logs for more information.","danger");
                        }
                    }
                }
            }
            catch(err){
                this.#showToastNotification("Oops","Something went wrong", "Check logs for more information.", "danger");
            }

            this.requestUpdate();

            //Reset normal buttons state
            target.processButtonState = undefined;
            target.trashButtonEnabled = true;
            target.downloadButtonEnabled = true;

        }
    }

    private showImagePreview(e: Event){
        const previewElement = this.previewModal as ImagePreview;

        if(previewElement){

            const target = e.target as HTMLDivElement;

                let imgPath = target.dataset.imgPath ?? "";
                let imgName = target.dataset.imgName ?? "";

                previewElement.showPreview(imgName, imgPath);
            
        }
    }

    private async trashSelectedImages(e: Event){
        let target = e.target;

        if(target instanceof ProcessImagePanel){

            const selectedImages = this.itemsList.getSelectedItems();

            //Set buttons states and visibility
            target.trashButtonState = "waiting";
            target.processButtonEnabled = false;
            target.downloadButtonEnabled = false;


            const response = await this.#mediaToolsContext?.trashMedia({requestBody: selectedImages.map(item => item.id)});

            if(response){
                let responseData = response.data;
                if(responseData){

                    const trashedIds = responseData.payload as Array<number>;

                    //This is slow
                    for(var i = 0; i < trashedIds.length; i++)
                    {
                        for(let x = 0; x < selectedImages.length; x ++){
                            if(trashedIds[i] == selectedImages[x].id){
                                this.itemsList.remove(selectedImages[x]);
                            }
                        } 
                    }
                    
                    switch (responseData.status){
                        case "Success":
                            this.#showToastNotification("Success", responseData.message, "", "positive");
                            break;
                        case "Warning":
                            this.#showToastNotification("Success", responseData.message, "", "warning");
                            break;
                        case "Error":
                            this.#showToastNotification("Success", responseData.message, "", "danger");
                            break;
                    }
                }
            }

            //Reset buttons state and visibility
            target.trashButtonState = undefined;
            target.processButtonEnabled = true;
            target.downloadButtonEnabled = true;

            this.requestUpdate();
        }

    }

    private async downloadSelectedMedia(e: Event){

        let target = e.target;

        if(target instanceof ProcessImagePanel){
            const selectedImages = this.itemsList.getSelectedItems();

            //Set buttons states
            target.downloadButtonState = "waiting";
            target.processButtonEnabled = false;
            target.trashButtonEnabled = false; 

            const response = await this.#mediaToolsContext?.downloadMedia({requestBody: selectedImages.map(item => item.id)});

            if(response){

                try{
                    const blob = response.data as Blob;
                    // Create a download link for the Blob
                    const downloadUrl: string = window.URL.createObjectURL(blob);
                    const a: HTMLAnchorElement = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = 'download.zip'; // Filename for the downloaded file
                    document.body.appendChild(a);
                    a.click(); // Trigger the download
                    a.remove(); // Clean up the DOM

                    //Free up memory
                    setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 100);
                }
                catch (error: unknown) {
                    if (error instanceof Error) {
                        console.error('There was an error downloading the file:', error.message);
                    } else {
                        console.error('An unknown error occurred during the file download.');
                    }
                }
            }

            //Reset buttons states and visibility
            target.downloadButtonState = undefined;
            target.processButtonEnabled = false;
            target.trashButtonEnabled = false; 
        }

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

            <div class="dashboard">
                <uui-box>

                    <image-search-bar width = "${this.width}" height = "${this.height}" @find-button-click="${this.searchGallery}"></image-search-bar>

                    <div style="display: flex">

                        <div class="leftPanel">
                            ${this.renderFilterResults()}
                        </div>
                        
                        <span class="rightPanel">
                            <process-image-panel
                                selectionCount="${this.itemsList.countSelectedItems()}"
                                width="${this.width}"
                                height="${this.height}"
                                convertMode="lossy"
                                convertQuality="85"
                                @process-images-click="${this.processSelectedImages}"
                                @trash-images-click="${this.trashSelectedImages}"
                                @download-images-click="${this.downloadSelectedMedia}"
                                @rename-media-click="${this.renameMedia}"></process-image-panel>
                            </process-image-panel>
                        </span>

                    </div>
                    
                </uui-box>
            </div>

            <image-preview id="imagePreviewElement"></image-preview>
            <rename-media-dialog id="renameMediaDialog"></rename-media-dialog>

            <uui-toast-notification-container 
                id="notificationContainer"
                auto-close="3000">
            </uui-toast-notification-container>
            
            
        `
    }

    renderFilterResults(){
        if(this.itemsList.count() > 0){
            return html`
                <uui-table aria-label="Filter results">

                    <uui-table-column style="width: 50px;"></uui-table-column>
                    <uui-table-column style="width: 30%;"></uui-table-column>
                    <uui-table-column style="width: 15%;"></uui-table-column>
                    <uui-table-column style="width: 15%;"></uui-table-column>
                    <uui-table-column style="width: 15%;"></uui-table-column>
                    <uui-table-column style="width: 15%;"></uui-table-column>

                    <uui-table-head>
                        <uui-table-head-cell>
                            <uui-checkbox name="selectAll" .checked="${this.allSelected}" @change="${this.toggleSelectAll}"></uui-checkbox>
                        </uui-table-head-cell>
                        <uui-table-head-cell>Name</uui-table-head-cell>
                        <uui-table-head-cell>Width</uui-table-head-cell>
                        <uui-table-head-cell>Height</uui-table-head-cell>
                        <uui-table-head-cell>Type</uui-table-head-cell>
                        <uui-table-head-cell>Size</uui-table-head-cell>
                    </uui-table-head>

                    ${this.itemsList.getPage(this.currentPage).map(img =>

                        html`
                            <uui-table-row 
                                class="${this.itemsList.isSelected(img) ? 'selectableRow selectedRow' : 'selectableRow'}"
                                id="${"image-id-" + img.id}"
                                data-image-row="${this.itemsList.indexOf(img)} "
                                @click="${this.itemRowClicked}">
                                <uui-table-cell>
                                    <div 
                                        class="imagePreview"
                                        width="45"
                                        height="45"
                                        style="background: url('${img.path}?width=45&height=45')"
                                        data-img-name="${img.name}"
                                        data-img-path="${img.path}"
                                        @click="${this.showImagePreview}">
                                    </div>
                                </uui-table-cell>

                                <uui-table-cell>${img.name}</uui-table-cell>
                                <uui-table-cell>${img.width}px</uui-table-cell>
                                <uui-table-cell>${img.height}px</uui-table-cell>
                                <uui-table-cell>${img.extension}</uui-table-cell>
                                <uui-table-cell>${img.size}</uui-table-cell>

                            </uui-table-row>
                        `
                        )}

                </uui-table>

                <uui-pagination 
                    style="margin-top: 1rem;"  
                    total="${this.itemsList.countPages()}" 
                    current="${this.currentPage}" 
                    @change="${this.changePage}" >
                </uui-pagination>

            `
        }
        else{
            return html `
                <h3 class="centered" style="color: gray; text-align: center">Filter your images by size and extension.</h3>
            `
        }
    }




    static styles = css`

        .banner{
            display:flex;
            align-items: center;
            justify-content: space-between;
            
        }
        .dashboard{
            padding: 1rem;
            height: 100%;
        }

        uui-box{
            margin-bottom: 0.8rem;
        }

        light{
            font-size: 0.8rem;
            font-weight: lighter;
        }

        .boxElement{
            display: inline-block;
            margin:0.2rem;
        }

        .muted{
            display: block;
            font-size: 0.8rem;
            font-style: italic;
            font-weight: lighter;
            text-align: center;
        }

        .flex{
            display: flex;
            flex-direction: row;
            justify-content: center;
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

        .leftPanel{
            flex: 70;
        }

        .rightPanel{
            width: 300px;
            height: auto;
            margin-left: 1rem;
            
        }

        .imageContainer{
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            padding: 1.5rem;
        }

        .imagePreview{
            display: block;
            width: 45px;
            height: 45px;
        }
        
        .selectableRow{
            cursor: pointer;
            opacity:1;
            transition: background-color 0.2s ease-in-out;
        }
            .selectableRow:hover {
                opacity:0.5;
            }

        .selectedRow{
            background-color: #EAF4FF;
        }

        .processedOk{
            background-color: #0d9b62;
        }

        .processedError{
            background-color: red;
        }

        .processedDeleted{
            background-color: red;
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

        .centered{
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
    `
}


export default GalleryWorkerDashboard

declare global {
    interface HtmlElementTagNameMap {
        'badgernet_umbraco_mediatools-gallery-worker-dash': GalleryWorkerDashboard
    }
}

