import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, state, query } from "@umbraco-cms/backoffice/external/lit";
import MediaToolsContext, { MEDIA_TOOLS_CONTEXT_TOKEN } from "../context/mediatools.context";
import {
    UUICheckboxElement,
    UUIPaginationElement, UUISelectElement,
    UUITableCellElement,
    UUITableRowElement,
    UUIToastNotificationContainerElement,
    UUIToastNotificationElement
} from "@umbraco-cms/backoffice/external/uui";
import {FilterGalleryData, ImageMediaDto, OperationResponse, ProcessImagesData, RenameMediaData} from "../api";
import { SelectablePagedList } from "../code/pagedList";
import "../elements/galleryToolsPanel.element.ts";
import ProcessImagePanel, { ProcessingSettings } from "../elements/galleryToolsPanel.element.ts";
import ImagePreview from "../elements/imagePreview.element.ts";
import "../elements/imagePreview.element.ts"
import GallerySearchBar from "../elements/gallerySearchBar.element.ts";
import "../elements/gallerySearchBar.element.ts"
import RenameMediaDialog from "../elements/renameMediaDialog.element.ts";  
import "../elements/renameMediaDialog.element.ts"
import ImageEditorDialog from "../elements/imageEditorDialog.element.ts";
import "../elements/imageEditorDialog.element.ts"
import AcceptRejectDialog from "../elements/acceptRejectDialog.element.ts";
import "../elements/acceptRejectDialog.element.ts"



@customElement('badgernet_umbraco_mediatools-gallery-worker-dash')
export class GalleryDashboard extends UmbElementMixin(LitElement) {

    #mediaToolsContext?: MediaToolsContext;

    @state() width: number = 1;
    @state() height: number = 1;

    @state() currentPage: number = 1;
    @state() itemsList: SelectablePagedList<ImageMediaDto> = new SelectablePagedList<ImageMediaDto>(10);
    @state() allSelected: boolean = false;
    @state() resultsPerPage: number = 10;

    @query("#imagePreviewElement") previewModal!: ImagePreview;
    @query("#renameMediaDialog") renameMediaDialog!: RenameMediaDialog;
    @query("#editImageDialog") editImageDialog!: ImageEditorDialog;
    @query("#acceptRejectDialog") acceptRejectDialog!: AcceptRejectDialog;

    #itemsPerPageOptions: Option[] = [
        {name: "10", value: "10", selected: true},
        {name: "15", value: "15"},
        {name: "20", value: "20"},
        {name: "30", value: "30"},
        {name: "50", value: "50"},
        {name: "100", value: "100"}
    ];
    
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

    //Toggling row selection
    private handleRowClicked(e: Event){
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

    //Selects all rows
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

    //Fetches and updates one image row -> e.detail must be image-Id
    private async updateImageRow(e: CustomEvent){
        const imageId = e.detail as number;

        if(!imageId && imageId < 0) return;

        const response = await this.#mediaToolsContext?.getMediaInfo({mediaId: imageId});

        if(response && !response.error){
            const updatedImage = response.data as ImageMediaDto;
            
            const images = this.itemsList.getPage(this.currentPage);
            if(images.length > 0 ){
                for(let i= 0 ; i < images.length ; i++ ){
                    if(images[i].id === updatedImage.id){
                        this.itemsList.replace(images[i], updatedImage);
                        this.requestUpdate(); //Redraw list 
                        break; //Exit after first hit
                    }
                }
            }
        }
    }

    //Changes pages (pagination) 
    private handleChangePage(e: Event){
        const target = e.target;
        if(target instanceof UUIPaginationElement){
            this.currentPage = target.current;
        }
    }

    //Searches media section 
    private async searchGallery(e: CustomEvent){
        let target = e.target;

        if(target instanceof GallerySearchBar){

            target.findButtonState = "waiting"; //Loading button look

            this.itemsList.clear();
            this.allSelected = false;

            try{

                const requestData = e.detail as FilterGalleryData;
                const response = await this.#mediaToolsContext?.filterGallery(requestData);

                if(response?.data){
                    this.itemsList.fromArray(response.data);
                }
                this.requestUpdate(); //Update list
                target.findButtonState = undefined;//Normal button look
            }
            catch(error){
                this.#showToastNotification("Oops!","Something went wrong", "", "danger");
            }
        }
    }

    //Opens popup to rename media
    private async renameMedia(e: Event){

        const imgRow = (e.target as HTMLDivElement).closest("uui-table-row");
        if(!imgRow) return;
        
        const imgIndex = Number(imgRow.dataset.imageRow ?? -1);
        if(imgIndex < 0)return;
        
        const image = this.itemsList.itemAt(imgIndex);
        if(!image) return;


        const dialog = this.renameMediaDialog as RenameMediaDialog;
        if(!dialog) return;
        
        dialog.showModal(image.name, async () => {

            const requestData: RenameMediaData = {
                mediaId: image.id,
                newName: dialog.mediaName
            }

            const response = await this.#mediaToolsContext?.renameMedia(requestData);
            if(response){
                const operationResponse = response.data as OperationResponse;
                if(operationResponse){
                    if(operationResponse.status === "Success"){
                        this.#showToastNotification("Done",operationResponse.message, "","positive");
                        image.name = dialog.mediaName;
                        this.requestUpdate();
                    }
                }
            }
        });
    }
    
    //Opens popup image editor
    private editMedia(e: Event){
        const imgRow = (e.target as HTMLDivElement).closest("uui-table-row");
        if(imgRow){
            //Find editor element 
            const editor = this.editImageDialog as ImageEditorDialog;
            if (editor == undefined) return;

            const filePath = imgRow.dataset.imagePath;
            const imageId = Number(imgRow.dataset.imageId ?? -1);
            
            if(!filePath || imageId < 0) return;
            
            //Open editor
            editor.openEditor(900, 900, filePath, imageId);
        }
    }
    
    //Lets selected images get resized and/or converted
    private async processSelectedImages(e: CustomEvent) {
        let target = e.composedPath()[0];
        if (target instanceof ProcessImagePanel) {

            const acceptDialog = this.acceptRejectDialog;
            if (acceptDialog) {
                acceptDialog.build("Are you sure?", "Do you want to resize and/or convert selected items?", "", "Yes", "No");
                const accepted = await acceptDialog.show();

                if (accepted) {

                    let settings = e.detail as ProcessingSettings;

                    if (this.itemsList.countSelectedItems() < 1) {
                        this.#showToastNotification("Oops!", "You need to select some images first.", "", "warning");
                        return;
                    }

                    //Set buttons styles 
                    target.processButtonState = "waiting";
                    target.trashButtonEnabled = false;
                    target.downloadButtonEnabled = false;

                    const selectedItems = this.itemsList.getSelectedItems();

                    let requestData: ProcessImagesData = {
                        requestBody: {
                            ids: selectedItems.map((item) => item.id),
                            resize: settings.resize,
                            resizeMode: settings.resizeMode,
                            width: settings.width,
                            height: settings.height,
                            convert: settings.convert,
                            convertMode: settings.convertMode,
                            convertQuality: settings.convertQuality
                        }
                    }

                    try {
                        const response = await this.#mediaToolsContext?.processImage(requestData);

                        if (response) {
                            const operationResponse = response.data;

                            if (operationResponse) {
                                if (operationResponse.status === "Warning") {
                                    this.#showToastNotification("Done", operationResponse.message, "Check logs for more information.", "warning");
                                    const processedImages = operationResponse.payload as Array<ImageMediaDto>

                                    for (let i = 0; i < processedImages.length; i++) {
                                        for (let x = 0; x < selectedItems.length; x++) {
                                            if (processedImages[i].id === selectedItems[x].id) {
                                                this.itemsList.replace(selectedItems[x], processedImages[i]);
                                            }
                                        }
                                    }

                                } else if (operationResponse.status === "Success") {
                                    this.#showToastNotification("Done", operationResponse.message, "", "positive");
                                    const processedImages = operationResponse.payload as Array<ImageMediaDto>

                                    for (let i = 0; i < processedImages.length; i++) {
                                        for (let x = 0; x < selectedItems.length; x++) {
                                            if (processedImages[i].id === selectedItems[x].id) {
                                                this.itemsList.replace(selectedItems[x], processedImages[i]);
                                            }
                                        }
                                    }

                                } else {
                                    this.#showToastNotification("Oops", "Something went wrong", "Check logs for more information.", "danger");
                                }
                            }
                        }
                    } catch (err) {
                        this.#showToastNotification("Oops", "Something went wrong", "Check logs for more information.", "danger");
                    }

                    this.requestUpdate();

                    //Reset normal buttons state
                    target.processButtonState = undefined;
                    target.trashButtonEnabled = true;
                    target.downloadButtonEnabled = true;


                }
            }
        }
    }
    
    //Opens image preview popup
    private async showImagePreview(e: Event){
        const imgRow = (e.target as HTMLDivElement).closest("uui-table-row");
        if(imgRow){
            const previewElement = this.previewModal as ImagePreview;
            if(previewElement) {

                let imgId = Number(imgRow.dataset.imageId ?? -1);
                if (imgId < 0) return;

                await previewElement.showPreview(imgId);
            }
        }
    }

    //Opens metadata preview popup
    private async showMetadataPreview(e: Event){
        const imgRow = (e.target as HTMLDivElement).closest("uui-table-row");
        if(imgRow){
            const previewElement = this.previewModal as ImagePreview;
            if(previewElement) {

                let imgId = Number(imgRow.dataset.imageId ?? -1);
                if (imgId < 0) return;

                await previewElement.showPreview(imgId, true);
            }
        }
    }
    
    //Moves single image to trash
    private async recycleSingleImage(e: Event){
        if(!this.#mediaToolsContext)return; 
        
        const imgRow = (e.target as HTMLDivElement).closest("uui-table-row");
        if(!imgRow) return;
        let imgId = Number(imgRow.dataset.imageId ?? -1);
        if(imgId < 0) return;
        
        const dialog = this.acceptRejectDialog as AcceptRejectDialog;
        if(dialog == null) return;
        
        dialog.build("Are you sure?","Do you want to move this image to trash?", "", "Yes", "Cancel");
        const accepted = await dialog.show();
        if(accepted){
            
            const response = await this.#mediaToolsContext?.trashMedia({requestBody: [imgId]});

            if(response) {
                let responseData = response.data as OperationResponse;
                if (responseData) {
                    const trashedIds = responseData.payload as Array<number>;

                    //There should only be one id 
                    if (trashedIds.length === 1) {
                        let allItems = this.itemsList.getItems();
                        for (let x = 0; x < allItems.length; x++) {
                            if (trashedIds[0] == allItems[x].id) {
                                this.itemsList.remove(allItems[x]);
                            }
                        }
                    }

                    this.#showOperationNotification(responseData)
                    this.requestUpdate();
                }
            }
            
        }
    }

    //Moves selected media to trash
    private async recycleSelectedImages(e: Event){
        let target = e.composedPath()[0];
        if(target instanceof ProcessImagePanel){

            const selectedImages = this.itemsList.getSelectedItems();
            
            const acceptDialog = this.acceptRejectDialog;
            if(!acceptDialog) return;

            acceptDialog.build("Are you sure?", "Do you want to recycle " + selectedImages.length +" media?","","Yes", "No");
            const accepted = await acceptDialog.show();
            
            if(accepted)
            {
                //Set buttons states and visibility
                target.trashButtonState = "waiting";
                target.processButtonEnabled = false;
                target.downloadButtonEnabled = false;

                const response = await this.#mediaToolsContext?.trashMedia({requestBody: selectedImages.map(item => item.id)});

                if(response){
                    let responseData = response.data;
                    if(responseData){

                        const trashedIds = responseData.payload as Array<number>;

                        //This is slow - removing trashed images from the list
                        for(let i = 0; i < trashedIds.length; i++)
                        {
                            for(let x = 0; x < selectedImages.length; x ++){
                                if(trashedIds[i] == selectedImages[x].id){
                                    this.itemsList.remove(selectedImages[x]);
                                }
                            }
                        }

                        this.#showOperationNotification(responseData);
                        
                        //Reset buttons state and visibility
                        target.trashButtonState = undefined;
                        target.processButtonEnabled = true;
                        target.downloadButtonEnabled = true;

                        this.requestUpdate();
                    }
                }
            }
        }
    }
    
    //Download selected media
    private async downloadSelectedMedia(e: Event){

        let target = e.composedPath()[0];
        if(target instanceof ProcessImagePanel){
                
            const acceptDialog = this.acceptRejectDialog;
            if(acceptDialog){
                
                acceptDialog.build("Are you sure?", "Do you want to download selected items?","If the archive exceeds 300Mb any further images will be skipped.", "Yes", "No");
                const accepted = await acceptDialog.show();
                if(accepted){
                    
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
        }
    }
    
    //Change items per Page
    #handleItemsPerPageChanged(e: Event){
        var target = e.target;
        if(target instanceof UUISelectElement){
            this.itemsList.pageSize = Number(target.value);
            this.requestUpdate();
        }
    }
    

    #showOperationNotification(operationResponse:OperationResponse){
        switch (operationResponse.status){
            case "Success":
                this.#showToastNotification("Success", operationResponse.message, "", "positive");
                break;
            case "Warning":
                this.#showToastNotification("Warning", operationResponse.message, "", "warning");
                break;
            case "Error":
                this.#showToastNotification("Error", operationResponse.message, "", "danger");
                break;
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
                    <gallery-search-bar width = "${this.width}" height = "${this.height}" @find-button-click="${this.searchGallery}"></gallery-search-bar>

                    <div style="display: flex">
                        <div class="leftPanel">
                            ${this.renderImagesTable()}
                        </div>
                        
                        <span class="rightPanel">
                            <gallery-tools-panel
                                selectionCount="${this.itemsList.countSelectedItems()}"
                                width="${this.width}"
                                height="${this.height}"
                                convertMode="Lossy"
                                convertQuality="85"
                                @process-images-click="${this.processSelectedImages}"
                                @trash-images-click="${this.recycleSelectedImages}"
                                @download-images-click="${this.downloadSelectedMedia}">
                            </gallery-tools-panel>
                        </span>
                    </div>
                </uui-box>
            </div>

            <accept-reject-dialog id="acceptRejectDialog"></accept-reject-dialog>
            <image-preview id="imagePreviewElement"></image-preview>
            <rename-media-dialog id="renameMediaDialog"></rename-media-dialog>
            
            <image-editor-dialog id="editImageDialog"
                                 @update-list="${this.updateImageRow}">
            </image-editor-dialog>

            <uui-toast-notification-container 
                id="notificationContainer"
                auto-close="3000">
            </uui-toast-notification-container>
        `
    }

    renderImagesTable(){
        if(this.itemsList.count() > 0){
            return html`
                <uui-table aria-label="Filter results">

                    <uui-table-column style="width: 50px;"></uui-table-column>
                    <uui-table-column style="width: 1rem;"></uui-table-column>
                    <uui-table-column style="width: auto;"></uui-table-column>
                    <uui-table-column style="width: 8rem;"></uui-table-column>
                    <uui-table-column style="width: 8rem;"></uui-table-column>
                    <uui-table-column style="width: 8rem;"></uui-table-column>
                    <uui-table-column style="width: 8rem;"></uui-table-column>
                    <uui-table-column style="width: 8rem;"></uui-table-column>

                    <uui-table-head>
                        <uui-table-head-cell>
                            <uui-checkbox name="selectAll" label="Select all" .checked="${this.allSelected}" @change="${this.toggleSelectAll}">All</uui-checkbox>
                        </uui-table-head-cell>
                        <uui-table-head-cell></uui-table-head-cell>
                        <uui-table-head-cell>Name</uui-table-head-cell>
                        <uui-table-head-cell>Width</uui-table-head-cell>
                        <uui-table-head-cell>Height</uui-table-head-cell>
                        <uui-table-head-cell>Format</uui-table-head-cell>
                        <uui-table-head-cell>Size</uui-table-head-cell>
                        <uui-table-head-cell></uui-table-head-cell>
                    </uui-table-head>

                    ${this.itemsList.getPage(this.currentPage).map(img =>

                        html`
                            <uui-table-row class="${this.itemsList.isSelected(img) ? 'selectableRow selectedRow' : 'selectableRow'}"
                                           data-image-id="${img.id}"
                                           data-image-row="${this.itemsList.indexOf(img)}"
                                           data-image-path="${img.path}"
                                           @click="${this.handleRowClicked}">

                              
                                <uui-table-cell>
                                    <div 
                                        class="imagePreview"
                                        style="background: url('${img.path}?width=45&height=45')"
                                        @click="${this.showImagePreview}">
                                    </div>
                                </uui-table-cell>

                                <uui-table-cell style="padding-left: 1rem">
                                    <uui-action-bar>
                                        <uui-button title="Rename media" label="rename" pristine="" look="secondary"
                                                    @click="${this.renameMedia}">
                                            <uui-icon name="edit"></uui-icon>
                                        </uui-button>
                                    </uui-action-bar>
                                </uui-table-cell>
                                <uui-table-cell>${img.name}</uui-table-cell>
                                <uui-table-cell>${img.width}px</uui-table-cell>
                                <uui-table-cell>${img.height}px</uui-table-cell>
                                <uui-table-cell>${img.extension}</uui-table-cell>
                                <uui-table-cell>${img.size}</uui-table-cell>
                                <uui-table-cell>
                                    <uui-action-bar>
                                        <uui-button title="Edit image" 
                                                    label="edit" pristine=""
                                                    look="secondary" 
                                                    @click="${this.editMedia}">
                                            <uui-icon name="wand"></uui-icon>
                                        </uui-button>

                                        <uui-button title="Metadata" label="metadata" pristine="" look="secondary"
                                                    @click="${this.showMetadataPreview}">
                                            <uui-icon name="code"></uui-icon>
                                        </uui-button>
                                        
                                        <uui-button title="Move to trash" 
                                                    label="delete" pristine="" 
                                                    look="secondary" color="danger"
                                                    @click="${this.recycleSingleImage}">
                                            <uui-icon name="delete"></uui-icon>
                                        </uui-button>
                                    </uui-action-bar>
                                </uui-table-cell>

                            </uui-table-row>
                        `
                        )}
                </uui-table>

                <uui-pagination 
                    style="margin-top: 1rem;"  
                    total="${this.itemsList.countPages()}" 
                    current="${this.currentPage}" 
                    @change="${this.handleChangePage}" >
                </uui-pagination>
                
                <uui-select style="margin-top: 0.5rem;"
                            .options="${this.#itemsPerPageOptions}" 
                            @change="${this.#handleItemsPerPageChanged}">
                </uui-select>
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
        
        uui-table-cell{
            padding: 0.5rem;
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
                -webkit-box-shadow: inset 0 0 10px 0 rgba(0,0,0,0.2);
                box-shadow: inset 0 0 10px 0 rgba(0,0,0,0.2);
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


export default GalleryDashboard

declare global {
    interface HtmlElementTagNameMap {
        'badgernet_umbraco_mediatools-gallery-worker-dash': GalleryDashboard
    }
}

