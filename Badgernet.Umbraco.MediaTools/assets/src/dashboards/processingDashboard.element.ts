import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, property, state, query,  ifDefined } from "@umbraco-cms/backoffice/external/lit";
import { BoxEventDetail } from "../code/box.event";
import MediaToolsContext, { MEDIA_TOOLS_CONTEXT_TOKEN } from "../context/mediatools.context";
import "../elements/inputElements/toggleBox.element.ts"
import "../elements/inputElements/inputBox.element.ts"
import "../elements/inputElements/sliderBox.element.ts"
import "../elements/inputElements/radioBox.element.ts"
import { UserSettingsDto, ConvertMode } from "../api";
import { UUIToastNotificationContainerElement, UUIToastNotificationElement } from "@umbraco-cms/backoffice/external/uui";
import { UMB_CURRENT_USER_CONTEXT, UmbCurrentUserModel } from "@umbraco-cms/backoffice/current-user";

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
    @state() resizerCounter?: number;
    @state() converterCounter?: number;
    @state() bytesSavedResizing?: number;
    @state() bytesSavedConverting?: number;
    @state() currentUser?: UmbCurrentUserModel;

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

    //Handles events dispatched within input boxes
    private handleBoxEvent(e : CustomEvent<BoxEventDetail>){
        let targetProperty: string  = e.detail.targetProperty as keyof UserSettingsDto;
        let newValue: any = e.detail.newValue;
        
        switch (targetProperty as keyof UserSettingsDto){
            case 
        }
    }

    #toggleResizer(){
        if(!this.#mediaToolsContext) return;
        this.#mediaToolsContext.resizerEnabled = !this.resizerEnabled;
    }

    #toggleConverter(){
        if(!this.#mediaToolsContext) return;
        this.#mediaToolsContext.converterEnabled = !this.converterEnabled;
    }

    #resizerState(): string{
        return this.resizerEnabled ? "Enabled" : "Disabled";
    }

    #converterState(): string{
        return this.converterEnabled ? "Enabled" : "Disabled";
    }

    #showToastNotification(headline: string , message: string , color: '' | 'default' | 'positive' | 'warning' | 'danger' = '') {
        const con = this.renderRoot.querySelector('#notificationContainer') as UUIToastNotificationContainerElement;
        const toast = document.createElement('uui-toast-notification') as UUIToastNotificationElement;
        toast.color = color;
        const toastLayout = document.createElement('uui-toast-notification-layout');
        toastLayout.headline = headline;
        toast.appendChild(toastLayout);

        const messageEl = document.createElement('span');
        messageEl.innerHTML = message;
        toastLayout.appendChild(messageEl);

        if (con) {
            con.appendChild(toast);
        }
    }

    render() {
        return html`

        <div class="dashboard">
            <uui-box>
                <div slot="headline">
                    <uui-label >📏 Resolution limiter <light>(${this.#resizerState()})</light></uui-label>
                    <uui-label class="muted" >Any images being uploaded that exceed the specified resolution will be sized-down to the desired resolution.</uui-label>
                </div>

                <uui-toggle slot="header-actions" label="" ?checked=${this.resizerEnabled} @change="${this.#toggleResizer}"></uui-toggle>

                <input-box
                    class="boxElement"
                    name="Max Width"
                    description="Image width in px"
                    targetProperty="targetWidth"
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
                    targetProperty="targetHeight"
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
                    targetProperty="ignoreAspectRatio"
                    ?checked="${this.ignoreAspectRatio}"
                    .disabled="${!this.resizerEnabled}"
                    @toggle="${this.handleBoxEvent}">
                </toggle-box>
            </uui-box> 

            <uui-box>
                <div slot="headline">
                    <uui-label >♾️ WebP Converter <light>(${this.#converterState()})</light></uui-label>
                    <uui-label class="muted">Any images being uploaded will be converted to .webp format, resulting in a smaller file size without losing too much image quality.</uui-label>
                </div>

                <uui-toggle slot="header-actions" label="" ?checked=${this.converterEnabled} @change="${this.#toggleConverter}"></uui-toggle>

                    <slider-box
                        class="boxElement"
                        name="Convert quality"
                        description="Higher values produces better image quality but also bigger in size. "
                        min=5 max=100 step=5
                        .hideSteps="${false}"
                        targetProperty="convertQuality"
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
                        targetProperty="convertMode"
                        @change="${this.handleBoxEvent}">
                </radio-box>

            </uui-box> 
            
            <uui-box>
                <div slot="headline">
                    <uui-label >🤐 Metadata remover <light>(${this.#resizerState()})</light></uui-label>
                    <uui-label class="muted" >Remove metadata from images that you upload to Umbraco.</uui-label>
                </div>
                
                <uui-box headline="Exclude from removing">
                    
                    <uui-checkbox name="indeterminate-child" pristine="" value="date time" label="Date & Time"></uui-checkbox>
                    <uui-checkbox name="indeterminate-child" pristine="" value="camera data" label="Camera Info"></uui-checkbox>
                    <uui-checkbox name="indeterminate-child" pristine="" value="camera data" label="GPS Data"></uui-checkbox>
                    <uui-checkbox name="indeterminate-child" pristine="" value="camera data" label="Copyright & Author"></uui-checkbox>
                </uui-box>

                <uui-toggle slot="header-actions" label="" ?checked=${this.resizerEnabled} @change="${this.#toggleResizer}"></uui-toggle>

            </uui-box> 

            <uui-box headline="⚙️ General" headlineVariant="h4">

                <toggle-box 
                    class="boxElement"
                    name="Keep original images" 
                    description="If turned on, original images do not get deleted"
                    targetProperty="keepOriginals"
                    ?checked="${this.keepOriginals}"
                    @toggle="${this.handleBoxEvent}">
                </toggle-box>

                <input-box
                    class="boxElement"
                    name="Ignore Keyword"
                    description="Images containing this keyword in its name will not get processed"
                    targetProperty="ignoreKeyword"
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

        .stat{
            text-align:center;
            font-weight: 300;
            margin-left: 1rem;
            margin-right: 1rem;
        }

        .separator{
            background-color: lightgray;
            width:1px;
            height:100%
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

    `
}


export default ProcessingDashboard

declare global {
    interface HtmlElementTagNameMap {
        'badgernet_umbraco_mediatools-upload-worker-dash': ProcessingDashboard
    }
}

