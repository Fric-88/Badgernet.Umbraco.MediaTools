import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, property, state, ifDefined} from "@umbraco-cms/backoffice/external/lit";
import { UUIInputElement, UUIButtonState, UUIRadioGroupElement } from "@umbraco-cms/backoffice/external/uui";
import { ConvertMode } from "../api";



@customElement('my-media-tools-panel')
export class MyMediaToolsPanel extends UmbElementMixin(LitElement) {

    constructor() {
        super();
    }

    @property({type: Number}) selectionCount: number = 0;

    @state() resize: boolean = false; 
    @state() resizeMode: ResizeMode = "FitInside";
    @property({attribute: true, type: Number}) width: number = 1;
    @property({attribute : true, type: Number}) height: number = 1;
    
    @state() convert: boolean = false;
    @property({attribute: true, type: String}) convertMode: ConvertMode = "Lossy";
    @property({attribute: true, type: Number}) convertQuality: number = 85;   

    @property({type: String}) processButtonState: UUIButtonState; //Allowing parent element change button state
    @property({type: Boolean}) processButtonEnabled: boolean = true; 
    @property({type: String}) trashButtonState: UUIButtonState;  //Allowing parent element change button state
    @property({type: Boolean}) trashButtonEnabled: boolean = true; 
    @property({type: String}) downloadButtonState: UUIButtonState;  //Allowing parent element change button state
    @property({type: Boolean}) downloadButtonEnabled: boolean = true; 

    //Dispatches "Trash" button click event
    private dispatchRecycleEvent(){
        const event = new CustomEvent("trash-images-click",{
            detail: { message: 'Button clicked!' },
            bubbles: true,       // Allows the event to bubble up through the DOM
            composed: true       // Allows the event to pass through shadow DOM boundaries
        });
        this.dispatchEvent(event);
    }

    //Asks before dispatching "Process" button click event
    private dispatchProcessEvent(){
        
        const eventDetail: ProcessingSettings= { 
            resize: this.resize, 
            convert: this.convert,
            resizeMode: this.resizeMode,
            width: this.width,
            height: this.height,
            convertMode: this.convertMode,
            convertQuality: this.convertQuality
        };

        const event = new CustomEvent("process-images-click", {
            detail: eventDetail,
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(event);
    }

    //Dispatch "Download" button click event
    private dispatchDownloadEvent(){
        const event = new CustomEvent("download-images-click",{
            detail: { message: 'Button clicked!' },
            bubbles: true,       // Allows the event to bubble up through the DOM
            composed: true       // Allows the event to pass through shadow DOM boundaries
        });
        
        this.dispatchEvent(event);
    }

    private toggleResize(){
        this.resize = !this.resize;
    }
    
    private toggleConvert(){
        this.convert = !this.convert;
    }

    private widthChanged(e: Event){
        let target = e.target as UUIInputElement
        this.width = Number(target.value);
    }

    private heightChanged(e: Event){
        let target = e.target as UUIInputElement
        this.height = Number(target.value);
    }

    private resizeModeChanged(e: Event){
        const target = e.target;

        if(target instanceof UUIRadioGroupElement){
            this.resizeMode = target.value as ResizeMode;
        }
    }


    render() {
        return html`

            <div class="toolbox">

                <uui-toggle label-position="left" label="Resize toggle" name="resize" .checked="${this.resize}" @change="${this.toggleResize}">Resize</uui-toggle>
                
                <div style="display: flex; gap: 1rem;">  
                    <div class="settingItem">
                        <uui-label for="Width">Width</uui-label>
                        <uui-input 
                            label="Width"
                            name="Width"
                            type="number" min="1" step="1" value="${this.width}"
                            .disabled="${!this.resize}"
                            @change="${this.widthChanged}">
                        </uui-input>
                    </div>

                    <div class="settingItem">
                        <uui-label  for="Height">Height</uui-label>
                        <uui-input 
                            label="Height"
                            name="Height"
                            type="number" min="1" step="1" value="${this.height}"
                            .disabled="${!this.resize}"
                            @change="${this.heightChanged}">
                        </uui-input>
                    </div>
                </div>

                <div class="settingItem">
                    <uui-radio-group name="Convert mode" .value="${'FitInside'}" .disabled="${!this.resize}" @change="${this.resizeModeChanged}">
                        <uui-radio style="display: inline-block;" value="FitInside">Fit box</uui-radio>
                        <uui-radio style="display: inline-block; margin-left: 0.5rem;" value="ExactSize">Exact size</uui-radio>
                    </uui-radio-group>
                </div>

            </div>

            <div class="toolbox" style="margin-top: 1rem;">

                <uui-toggle label="Convert toggle" label-position="left" 
                            name="convert" 
                            .checked="${this.convert}" 
                            @change="${this.toggleConvert}">Convert to WebP
                </uui-toggle>

                <div class="settingItem">
                    <uui-label for="Convert mode">Convert mode</uui-label>
                    <uui-radio-group name="Convert mode" .value="${'lossy'}" .disabled="${!this.convert}">
                        <uui-radio style="display: inline-block;" value="lossy">lossy</uui-radio>
                        <uui-radio style="display: inline-block; margin-left: 0.5rem;" value="lossless">lossless</uui-radio>
                    </uui-radio-group>
                </div>

                <div class="settingItem">
                    <uui-label for="Convert quality">Convert quality</uui-label>
                    <uui-slider 
                        style="padding-top: 0.5rem; margin-bottom: -1.5rem"
                        label="Convert quality"
                        min="${5}"
                        step="${5}"
                        ?hide-step-values="${false}"
                        .disabled="${!this.convert}"
                        value="85">
                    </uui-slider>
                </div>

            </div>

            <uui-button
                    label="Resize convert"
                    class="centered"
                    state=${ifDefined(this.processButtonState)}
                    look="primary"
                    color="positive"
                    style="margin-top: 0.5rem;"
                    .disabled="${(!this.resize && !this.convert) || this.selectionCount < 1 || !this.processButtonEnabled}"
                    popovertarget="areYouSurePopover"
                    @click="${this.dispatchProcessEvent}"> <uui-icon name="sync"></uui-icon> Resize / Convert (${this.selectionCount})
            </uui-button>
            
            <div style="display:flex; gap: 0.5rem">
                <uui-button 
                    label="Trash"
                    state=${ifDefined(this.trashButtonState)}
                    look="primary"
                    color="warning" 
                    style="margin-top: 0.5rem; width: 100%"
                    popovertarget="areYouSurePopover"
                    .disabled="${this.selectionCount < 1 || !this.trashButtonEnabled}"
                    @click="${this.dispatchRecycleEvent}"><uui-icon name="delete"></uui-icon> Trash (${this.selectionCount})
                </uui-button>

                <uui-button 
                    label="Download"
                    state=${ifDefined(this.downloadButtonState)}
                    look="primary"
                    color="default" 
                    style="margin-top: 0.5rem; width: 100%"
                    .disabled="${this.selectionCount < 1 || !this.downloadButtonEnabled}"
                    @click="${this.dispatchDownloadEvent}"><uui-icon name="download"></uui-icon> Download (${this.selectionCount})
                </uui-button>
            </div>
        `
    }

    static styles = css`

    .toolbox{
        border:1px #D8D7D9 solid;
        border-radius: 3px;
        overflow: hidden;
        padding: 1rem;
        
    }

    .settingItem{
        display: flex;
        flex-direction: column;
        align-self: flex-end;
        margin-top:1rem;
    }

    .centered{
        display: block;
        margin-left: auto;
        margin-right: auto;
    }
    `
}


export type ResizeMode = "FitInside"|"ExactSize"

export interface ProcessingSettings{
    resize: boolean;
    resizeMode: ResizeMode;
    width: number;
    height: number;
    convert: boolean;
    convertMode: ConvertMode;
    convertQuality: number;
}

export default MyMediaToolsPanel;

declare global {
    interface HtmlElementTagNameMap {
        'my-media-tools-panel': MyMediaToolsPanel
    }
}
0
