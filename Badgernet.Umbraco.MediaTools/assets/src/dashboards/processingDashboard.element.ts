import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, property, state, query,  ifDefined } from "@umbraco-cms/backoffice/external/lit";
import MediaToolsContext, { MEDIA_TOOLS_CONTEXT_TOKEN } from "../context/mediatools.context";
import "../elements/inputElements/toggleBox.element.ts"
import "../elements/inputElements/inputBox.element.ts"
import "../elements/inputElements/sliderBox.element.ts"
import "../elements/inputElements/radioBox.element.ts"
import { ConvertMode } from "../api";
import {
    UUICheckboxElement,
    UUIComboboxElement,
    UUIIconElement,
    UUIToastNotificationContainerElement,
    UUIToastNotificationElement
} from "@umbraco-cms/backoffice/external/uui";
import { UMB_CURRENT_USER_CONTEXT, UmbCurrentUserModel } from "@umbraco-cms/backoffice/current-user";
import {BoxControl} from "../elements/inputElements/BoxControl.ts";
import {verboseBool} from "../code/helperFunctions.ts";
import {exifTagOptions} from "../code/metadataTags.ts";

@customElement('badgernet_umbraco_mediatools-upload-worker-dash')
export class ProcessingDashboard extends UmbElementMixin(LitElement) {

    #mediaToolsContext?: MediaToolsContext;
    #convertModeOptions: ConvertMode[] = ["Lossy","Lossless"];

    @property() title: string = 'Badgernet.Umbraco.MediaTools dashboard'


    @state() resizerEnabled?: boolean;
    @state() converterEnabled?: boolean;
    @state() convertMode?: string;
    @state() convertQuality?: number;
    @state() ignoreAspectRatio?: boolean;
    @state() targetWidth?: number;
    @state() targetHeight?: number;
    @state() keepOriginals?: boolean;
    @state() ignoreKeyword?: string;
    @state() currentUser?: UmbCurrentUserModel;
    @state() metaRemoverEnabled?: boolean;
    @state() removeDateTime?: boolean;
    @state() removeCameraInfo?: boolean;
    @state() removeGpsInfo?: boolean;
    @state() removeXmpProfile?: boolean;
    @state() removeIptcProfile?: boolean;
    @state() removeShootingSituationInfo?: boolean;
    
    @state() selectedTags: string[] = [];
    @state() filteredTagsToRemove: string[] = exifTagOptions;

    @query('#notificationsContainer') notificationContainer: UUIToastNotificationContainerElement | undefined
    


    constructor() {
        super();

        this.consumeContext(MEDIA_TOOLS_CONTEXT_TOKEN,(_context) =>{

            this.#mediaToolsContext = _context;

            this.observe(_context.resizerEnabled, (_value) => { this.resizerEnabled = _value; });
            this.observe(_context.converterEnabled, (_value) => { this.converterEnabled = _value; } ); 
            this.observe(_context.convertQuality, (_value) => { this.convertQuality = _value} );
            this.observe(_context.convertMode, (_value) => { this.convertMode = _value; } ); 
            this.observe(_context.ignoreAspectRatio,(_value) => { this.ignoreAspectRatio = _value} );
            this.observe(_context.targetWidth, (_value) => { this.targetWidth = _value; } ); 
            this.observe(_context.targetHeight, (_value) => { this.targetHeight = _value} ); 
            this.observe(_context.keepOriginals, (_value) => { this.keepOriginals = _value} ); 
            this.observe(_context.ignoreKeyword, (_value) => { this.ignoreKeyword = _value} );
            this.observe(_context.removeDateTime, (_value) => { this.removeDateTime = _value} );
            this.observe(_context.removeCameraInfo, (_value) => { this.removeCameraInfo = _value} );
            this.observe(_context.removeGpsInfo, (_value) => { this.removeGpsInfo = _value} );
            this.observe(_context.removeShootingSituationInfo, (_value) => { this.removeShootingSituationInfo = _value} );
            this.observe(_context.metaRemoverEnabled, (_value) => { this.metaRemoverEnabled = _value; } );
            this.observe(_context.metaTagsToRemove, (_value) => { this.selectedTags = _value; } );
            this.observe(_context.removeXmpProfile, (_value) => { this.removeXmpProfile = _value; } );
            this.observe(_context.removeIptcProfile, (_value) => { this.removeIptcProfile = _value; } );
        });

        
        this.consumeContext(UMB_CURRENT_USER_CONTEXT, (instance) => {
            this._observeCurrentUser(instance);
        });
        
    }

    private async _observeCurrentUser(instance: typeof UMB_CURRENT_USER_CONTEXT.TYPE) {
        this.observe(instance.currentUser, (currentUser) => {
            this.currentUser = currentUser;
        });
    }

    connectedCallback(): void {

        super.connectedCallback();
        this.loadSettings().then(() => {
        }).catch(() => {
            this.#showToastNotification("Oops", "Cannot load MediaTools settings.","danger");
        });
    }

    //Read setting from a file on the server
    private async loadSettings(){

        if(this.currentUser)
        {
            await this.#mediaToolsContext?.loadSettings(this.currentUser.unique).catch(()=>{ 
                this.#showToastNotification("Oops", "Something went wrong","danger");
            });
        }
    }

    //Save settings to a file on a server
    private async saveSettings(){

        if(this.currentUser)
        {
            await this.#mediaToolsContext?.saveSettings(this.currentUser?.unique)
                .then(()=>{
                    this.#showToastNotification("Success","Settings saved","positive");
                })
                .catch(()=>{ 
                    this.#showToastNotification("Oops", "Something went wrong","danger");
                });
        }

    }

    //Handles events dispatched within box controls
    private handleBoxEvent(e : CustomEvent){
        
        if(!this.#mediaToolsContext) return;

        if(e.target instanceof BoxControl){
            const control = e.target as BoxControl;
            const controlIdentifier = control.controlIdentifier;
            const controlValue = e.detail;

            switch (controlIdentifier) {
                case "targetWidth":
                    this.#mediaToolsContext.targetWidth = controlValue;
                    break;
                case "targetHeight":
                    this.#mediaToolsContext.targetHeight = controlValue;
                    break;
                case "ignoreAspectRatio":
                    this.#mediaToolsContext.ignoreAspectRatio = controlValue;
                    break;
                case "convertQuality":
                    this.#mediaToolsContext.convertQuality = controlValue;
                    break;
                case "convertMode":
                    this.#mediaToolsContext.convertMode = controlValue;
                    break;
                case "keepOriginals":
                    this.#mediaToolsContext.keepOriginals = controlValue;
                    break;
                case "ignoreKeyword":
                    this.#mediaToolsContext.ignoreKeyword = controlValue;
                    break;
                default:
                    return;
            }
        }
    }

    //Resizer ON/OFF
    #toggleResizer(){
        if(!this.#mediaToolsContext) return;
        this.#mediaToolsContext.resizerEnabled = !this.resizerEnabled;
    }

    //Converter ON/OFF
    #toggleConverter(){
        if(!this.#mediaToolsContext) return;
        this.#mediaToolsContext.converterEnabled = !this.converterEnabled;
    }

    //Metadata remover ON/OFF
    #toggleMetaRemover(){
        if(!this.#mediaToolsContext) return;
        this.#mediaToolsContext.metaRemoverEnabled = !this.metaRemoverEnabled;
    }

    #toggleDateTime(){
        if(!this.#mediaToolsContext) return;
        this.#mediaToolsContext.removeDateTime = !this.removeDateTime
    }
    #toggleCameraInfo(){
        if(!this.#mediaToolsContext) return;
        this.#mediaToolsContext.removeCameraInfo = !this.removeCameraInfo
    }
    #toggleGpsInfo(){
        if(!this.#mediaToolsContext) return;
        this.#mediaToolsContext.removeGpsInfo = !this.removeGpsInfo
    }
    #toggleShootingSituationInfo(){
        if(!this.#mediaToolsContext) return;
        this.#mediaToolsContext.removeShootingSituationInfo = !this.removeShootingSituationInfo
    }
    
    
    #filterTagsOnInput(e: Event){
        
        if(e.target instanceof UUIComboboxElement){
            const target = e.target as UUIComboboxElement;
            const searchTerm = target.search.toLowerCase();
            if(searchTerm === ""){
                this.filteredTagsToRemove = exifTagOptions; //Show all options
            }
            else{
                this.filteredTagsToRemove = exifTagOptions.filter(tag =>
                    tag.toLowerCase().includes(searchTerm))
            }
        }
    }
    
    #selectMetaTag(e: Event){
        let target = e.target;
        if(target instanceof UUIComboboxElement){
            
            const tagName = target.value.toString();
            if(tagName && tagName !== ""){
                this.#mediaToolsContext?.addMetaTagsToRemove(tagName);
            }
        }
    }
    #removeMetaTag(e: Event){
        let target = e.target;
        if(target instanceof UUIIconElement){

            const tagName = target.dataset.tagName;
            if(tagName && tagName !== ""){
                this.#mediaToolsContext?.removeMetaTagsToRemove(tagName);
            }
        }
    }
    

    #showToastNotification(headline: string , message: string , color: '' | 'default' | 'positive' | 'warning' | 'danger' = '') {
        const container = this.renderRoot.querySelector('#notificationContainer') as UUIToastNotificationContainerElement;
        const toast = document.createElement('uui-toast-notification') as UUIToastNotificationElement;
        toast.color = color;
        const toastLayout = document.createElement('uui-toast-notification-layout');
        toastLayout.headline = headline;
        toast.appendChild(toastLayout);

        const messageEl = document.createElement('span');
        messageEl.innerHTML = message;
        toastLayout.appendChild(messageEl);

        if (container) {
            container.appendChild(toast);
        }
    }

    render() {
        return html`

        <div class="dashboard">
            <uui-box>
                <div slot="headline">
                    <uui-label >📏 Resolution limiter <light>(${verboseBool(this.resizerEnabled, "Enabled", "Disabled")})</light></uui-label>
                    <uui-label class="muted" >Any images being uploaded that exceed the specified resolution will be sized-down to the desired resolution.</uui-label>
                </div>

                <uui-toggle slot="header-actions" label="" ?checked=${this.resizerEnabled} @change="${this.#toggleResizer}"></uui-toggle>

                <input-box
                    class="boxElement"
                    name="Max Width"
                    description="Image width in px"
                    controlIdentifier="targetWidth"
                    type="number"
                    min="1"
                    step="1"
                    value="${ifDefined(this.targetWidth)}"
                    .disabled="${!this.resizerEnabled}"  
                    @change="${this.handleBoxEvent}">
                </input-box>

                <input-box
                    class="boxElement"
                    name="Max Height"
                    description="Image height in px"
                    controlIdentifier="targetHeight"
                    type="number"
                    min="1"
                    step="1"
                    value="${ifDefined(this.targetHeight)}"
                    .disabled="${!this.resizerEnabled}"  
                    @change="${this.handleBoxEvent}">
                </input-box>

                <toggle-box 
                    class="boxElement"
                    name="Ignore aspect ratio" 
                    description="If turned on, images may get stretched"
                    controlIdentifier="ignoreAspectRatio"
                    ?checked="${this.ignoreAspectRatio}"
                    .disabled="${!this.resizerEnabled}"
                    @toggle="${this.handleBoxEvent}">
                </toggle-box>
            </uui-box> 

            <uui-box>
                <div slot="headline">
                    <uui-label >♾️ WebP Converter <light>(${verboseBool(this.converterEnabled, "Enabled", "Disabled")})</light></uui-label>
                    <uui-label class="muted">Any images being uploaded will be converted to .webp format, resulting in a smaller file size without losing too much image quality.</uui-label>
                </div>

                <uui-toggle slot="header-actions" label="" ?checked=${this.converterEnabled} @change="${this.#toggleConverter}"></uui-toggle>

                    <slider-box
                        class="boxElement"
                        name="Convert quality"
                        description="Higher values produces better image quality but also bigger in size. "
                        min=5 max=100 step=5
                        .hideSteps="${false}"
                        controlIdentifier="convertQuality"
                        value="${ifDefined(this.convertQuality)}"
                        .disabled="${!this.converterEnabled}"
                        @change="${this.handleBoxEvent}">
                    </slider-box>

                    <radio-box
                        class="boxElement"
                        name="Convert mode"
                        description="Lossy produces smaller image file size, Lossless produces better image quality"
                        .options=${this.#convertModeOptions}
                        selected="${ifDefined(this.convertMode)}"
                        .disabled="${!this.converterEnabled}"
                        controlIdentifier="convertMode"
                        @change="${this.handleBoxEvent}">
                </radio-box>

            </uui-box> 
            
            <uui-box>
                <div slot="headline">
                    <uui-label >🧹 Metadata remover <light>(${verboseBool(this.metaRemoverEnabled, "Enabled", "Disabled")})</light></uui-label>
                    <uui-label class="muted" >Remove metadata from images that you upload to Umbraco.</uui-label>
                </div>

                <uui-toggle slot="header-actions" label="" ?checked=${this.metaRemoverEnabled} @change="${this.#toggleMetaRemover}"></uui-toggle>

                <div style="display: flex; flex-direction: column; gap:0.5rem; margin-bottom: 1rem;">
                    <uui-checkbox id="removeXmpCheckBox" label="Remove IPTC Profile" labelPosition="right"
                                  .checked="${this.removeIptcProfile}"
                                  .disabled="${!this.metaRemoverEnabled}"
                                  @change="${ () => this.#mediaToolsContext!.removeIptcProfile = !this.removeIptcProfile}">
                        Remove IPTC Profile <light><small> - ( Might contain data about Author and Copyright! )</small></light>
                    </uui-checkbox>
                    <uui-checkbox id="removeIptcCheckBox" label="Remove XMP Profile" labelPosition="right"
                                  .checked="${this.removeXmpProfile}"
                                  .disabled="${!this.metaRemoverEnabled}"
                                  @change="${ () => this.#mediaToolsContext!.removeXmpProfile = !this.removeXmpProfile}">
                        Remove XMP Profile <light><small> - ( Might contain data from editing software like Photoshop or GIMP )</small></light>
                    </uui-checkbox>
                </div>

                <p>EXIF Tag-groups to remove:</p>
                <uui-button-group id="tagGroupsButtons" style="margin-bottom: 1rem;">

                    <uui-button look="${this.removeDateTime ? "primary" : "secondary"}" color="default"
                                .disabled="${!this.metaRemoverEnabled}"
                                @click="${this.#toggleDateTime}">
                        
                        <uui-icon style="margin-bottom: 2px" name="${this.removeDateTime ? "check" : "remove"}"></uui-icon>
                        Dates & Timestamps
                    </uui-button>

                    <uui-button look="${this.removeGpsInfo ? "primary" : "secondary"}" color="default"
                                .disabled="${!this.metaRemoverEnabled}"
                                @click="${this.#toggleGpsInfo}">
                        <uui-icon style="margin-bottom: 2px" name="${this.removeGpsInfo ? "check" : "remove"}"></uui-icon>
                        GPS Tags
                    </uui-button>
                    
                    <uui-button look="${this.removeCameraInfo ? "primary" : "secondary"}" color="default"
                                .disabled="${!this.metaRemoverEnabled}"
                                @click="${this.#toggleCameraInfo}">
                        <uui-icon style="margin-bottom: 2px" name="${this.removeCameraInfo ? "check" : "remove"}"></uui-icon>
                        Camera & Lens Tags
                    </uui-button>

                    <uui-button look="${this.removeShootingSituationInfo ? "primary" : "secondary"}" color="default"
                                .disabled="${!this.metaRemoverEnabled}"
                                @click="${this.#toggleShootingSituationInfo}">
                        <uui-icon style="margin-bottom: 2px" name="${this.removeShootingSituationInfo ? "check" : "remove"}"></uui-icon>
                        Picture-Taking situation Tags
                    </uui-button>
                </uui-button-group>


                <p>Other tags to remove:</p>
                <uui-combobox pristine="" value=""
                              style="--uui-combobox-popover-max-height: 300px;"
                              .disabled="${!this.metaRemoverEnabled}"
                              @search="${this.#filterTagsOnInput}"
                              @change="${this.#selectMetaTag}">
                    <uui-combobox-list>
                        ${this.filteredTagsToRemove.map(tag => 
                            html`
                                <uui-combobox-list-option value="${tag}">${tag}</uui-combobox-list-option>
                            `
                        )}
                    </uui-combobox-list>
                </uui-combobox>
                
                <div class="metaTagsContainer">
                    ${this.selectedTags?.map(tag =>
                        html`
                            <div class="metaTag">
                                <uui-label>${tag}</uui-label>
                                <uui-icon name="remove" 
                                          style="margin-top: 3px; cursor: pointer" 
                                          data-tag-name="${tag}"
                                          @click="${this.#removeMetaTag}">
                                </uui-icon>
                            </div>
                        `
                    )}
                </div>

            </uui-box> 

            <uui-box headline="⚙️ General" headlineVariant="h4">

                <toggle-box 
                    class="boxElement"
                    name="Keep original images" 
                    description="If turned on, original images do not get deleted"
                    controlIdentifier="keepOriginals"
                    ?checked="${this.keepOriginals}"
                    @toggle="${this.handleBoxEvent}">
                </toggle-box>

                <input-box
                    class="boxElement"
                    name="Ignore Keyword"
                    description="Images containing this keyword in its name will not get processed"
                    controlIdentifier="ignoreKeyword"
                    type="text"
                    value="${ifDefined(this.ignoreKeyword)}"  
                    @change="${this.handleBoxEvent}">
                </input-box>
            
            </uui-box>

            <uui-button style="float: right;" label="Save changes" look="primary" color="positive" @click="${this.saveSettings}">Save settings</uui-button>

            <uui-toast-notification-container 
                id="notificationContainer"
                auto-close="3000">
            </uui-toast-notification-container>
        </div>
        `
    }

    static styles = css`


        .dashboard {
            padding: 1rem;
            height: 100%;
        }

        uui-box {
            margin-bottom: 0.8rem;
        }

        light {
            font-size: 0.8rem;
            font-weight: lighter;
        }

        .boxElement {
            display: inline-block;
            margin: 0.2rem;
        }

        .muted {
            display: block;
            font-size: 0.8rem;
            font-style: italic;
            font-weight: lighter;
            text-align: center;
        }

        .flex {
            display: flex;
            flex-direction: row;
            justify-content: center;
        }

        .stat {
            text-align: center;
            font-weight: 300;
            margin-left: 1rem;
            margin-right: 1rem;
        }

        .separator {
            background-color: lightgray;
            width: 1px;
            height: 100%
        }

        #notificationContainer {
            display: block;
            align-items: start;
            position: absolute;
            left: 0px;
            bottom: 50px;
            right: 15px;
            height: auto;
        }

        .metaTagsContainer {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 10px;
            margin: 1rem;
            
        }

        .metaTag {
            display: flex;
            flex-direction: row;
            padding: 5px;
            gap: 10px;
            background-color: #d0d0cb;
            border-radius: 15px;
        }



    `
}


export default ProcessingDashboard

declare global {
    interface HtmlElementTagNameMap {
        'badgernet_umbraco_mediatools-upload-worker-dash': ProcessingDashboard
    }
}

