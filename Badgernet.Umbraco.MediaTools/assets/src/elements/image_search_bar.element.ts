import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, state, property} from "@umbraco-cms/backoffice/external/lit";
import { UUIButtonState, UUIInputElement, UUISelectElement, UUISliderElement } from "@umbraco-cms/backoffice/external/uui";
import { FilterGalleryData, SizeFilter } from "../api";
import MediaToolsContext, { MEDIA_TOOLS_CONTEXT_TOKEN } from "../context/mediatools.context";


@customElement('image-search-bar')
export class ImageSearchBar extends UmbElementMixin(LitElement) {

    #mediaToolsContext?: MediaToolsContext;

    @property({attribute: true, type: Number}) width: number = 1920;
    @property({attribute: true, type: Number}) height: number = 1080;
    @state() findButtonState: UUIButtonState = undefined; 
    @state() resolutionFilter: SizeFilter = "AllSizes";
    @state() mediaFolders: Array<Option> =  [];

    private nameFilter: string = "";
    private extensionFilter: string = "";
    private selectedFolder: string = "";

    constructor() {
        super();
        this.consumeContext(MEDIA_TOOLS_CONTEXT_TOKEN,(_context) =>{
            this.#mediaToolsContext = _context;
            this.observe(_context.mediaFolders, (_value) => { this.mediaFolders = _value; });
        });

    }


    connectedCallback(): void {
        super.connectedCallback();

        this.#mediaToolsContext?.listFolders()
            .then( () => { 
                console.log("Fetching folders");
            })
            .catch(()=>{
                console.log("Something went wrong fetching media folders");
            });
        
    }

    #resolutionOptions: Array<Option> = [
        { name: "All", value: "AllSizes", selected: true },
        { name: "Bigger than", value: 'BiggerThan' },
        { name: "Smaller than", value: 'SmallerThan' },
    ];

    private folderSelectionChanged(e: Event){
        const target = e.target;
        if(target instanceof UUISelectElement){

            //Prevent setting 'All' as foldername. Setting it to '' will result in searching all folders
            let value = target.value.toString();
            if(value === "All"){
                value = ""; 
            }

            this.selectedFolder = value;
        }
    }

    private widthChanged(e: Event){
        const target = e.target;
        if(target instanceof UUIInputElement){
            this.width = Number(target.value.toString());
        }
    }

    private heightChanged(e: Event){
        const target = e.target;
        if(target instanceof UUIInputElement){
            this.height = Number(target.value.toString())
        }
    }

    private resolutionFilterChanged(e: Event){
        const target = e.target;
        if(target instanceof UUISelectElement){
            this.resolutionFilter = target.value as SizeFilter;
        }
    }

    private nameFilterChanged(e: Event){
        const target = e.target;
        if(target instanceof UUIInputElement){
            this.nameFilter = target.value.toString();
        }
        
    }

    private extensionFilterChanged(e: Event){
        const target = e.target;
        if(target instanceof UUIInputElement){
            this.extensionFilter = target.value.toString();
        } 
    }

    private findButtonClick(){

        let filterRequest: FilterGalleryData = {
            requestBody: {
                folderName: this.selectedFolder,
                width: this.width,
                height: this.height,
                nameLike: this.nameFilter,
                extensionLike: this.extensionFilter,
                sizeFilter: this.resolutionFilter
            }
        }

        const event = new CustomEvent("find-button-click",{
            detail: filterRequest,
            bubbles: true,       // Allows the event to bubble up through the DOM
            composed: true       // Allows the event to pass through shadow DOM boundaries
        });
        
        this.dispatchEvent(event);

    }

    render() {
        return html`

            <div slot="headline" class="settingsBar" >

                <div class="settingItem" style="flex: 1 1 120px;">
                    <uui-label class="inputLabel" for="Folder">Folder</uui-label> 
                    <uui-select
                        label="Select folder"
                        placeholder="Select an option"
                        .options="${this.mediaFolders}"
                        @change="${this.folderSelectionChanged}">
                    </uui-select>
                </div>

                <div class="settingItem" style="flex: 1 1 120px;">
                    <uui-label class="inputLabel" for="Dimensions">Resolution</uui-label> 
                    <uui-select 
                        label="Select option"
                        placeholder="Select an option"
                        .options="${this.#resolutionOptions}"
                        @change="${this.resolutionFilterChanged}">
                    </uui-select>
                </div>

                <div class="settingItem" style="flex: 1 1 80px;">
                    <uui-label class="inputLabel" for="Width">Width</uui-label>
                    <uui-input 
                        label="Width"
                        type="number"
                        min="1"
                        step="1"
                        value="${this.width}"
                        .disabled="${this.resolutionFilter === "AllSizes"}"
                        @change="${this.widthChanged}">
                    </uui-input>
                </div>

                <div class="settingItem" style="flex: 1 1 80px;">
                    <uui-label class="inputLabel" for="Height">Height</uui-label>
                    <uui-input 
                        label="Height"
                        type="number"
                        min="1"
                        step="1"
                        value="${this.height}"
                        .disabled="${this.resolutionFilter === "AllSizes"}"
                        @change="${this.heightChanged}">
                    </uui-input>
                </div>

                <div class="settingItem" style="flex: 3 1 200px;">
                    <uui-label class="inputLabel" for="Name">Filename</uui-label>
                    <uui-input 
                        label="Name"
                        type="text"
                        value="${this.nameFilter}"
                        @change="${this.nameFilterChanged}">
                    </uui-input>
                </div>

                <div class="settingItem" style="flex: 1 1 100px;">
                    <uui-label class="inputLabel" for="Extension">Extension</uui-label>
                    <uui-input 
                        label="Extension"
                        type="text"
                        value="${this.extensionFilter}"
                        @change="${this.extensionFilterChanged}">
                    </uui-input>
                </div>



                <div class="settingItem" style="flex: 1 1 150px;">
                    <uui-button label="Search" look="primary" color="default" .state="${this.findButtonState}" @click="${this.findButtonClick}">
                        <uui-icon name="search"></uui-icon> Search
                    </uui-button>
                </div>
            </div>

        `
    }

    static styles = css`

        .settingsBar{
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            padding-bottom:1rem;
        }

        .settingItem{
            display: flex;
            flex-direction: column;
            align-self: flex-end;
            justify-self: flex-end;
        }

        .inputLabel{
            padding-left: 0.2rem;
            font-size: 0.8rem;
            font-style: italic;
            font-weight: lighter;
        }
    `
}

export default ImageSearchBar;

declare global {
    interface HtmlElementTagNameMap {
        'image-search-bar': ImageSearchBar
    }
}

