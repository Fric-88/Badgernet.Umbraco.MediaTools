import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, query, state } from "@umbraco-cms/backoffice/external/lit";
import "./icons/imageEditorIconRegistry.ts"
import {UUIPopoverContainerElement, UUISliderElement} from "@umbraco-cms/backoffice/external/uui";

export type SliderValues = { 
    red: number;
    green: number; 
    blue: number; 
    brightness: number; 
    contrast: number; 
    exposure: number;
};
@customElement('editor-tools-panel')
export class ImageEditorTools extends UmbElementMixin(LitElement) {

    @state() menuOpen: boolean = false;
    @query("#adjust-popover") adjustPopover!: UUIPopoverContainerElement;
    @query("#rotate-popover") rotatePopover!: UUIPopoverContainerElement;
    @query("#crop-popover") cropPopover!: UUIPopoverContainerElement;
    
    //Used for throttling slider input events
    #eventThrottleTimer: number | null = null;  

    @state() red: number = 0;
    @state() green: number = 0;
    @state() blue: number = 0;
    @state() brightness: number = 0;
    @state() contrast: number = 0;
    @state() exposure: number = 1;
    @state() rotationAdjustment: number = 0;
    
    constructor() {
        super();
    }
    
    //Generic method for dispatching named events
    #dispatchEvent(eventName: string, detail?: any){
        const event = new CustomEvent(eventName,{
            bubbles: true,       // Allows the event to bubble up through the DOM
            composed: true,      // Allows the event to pass through shadow DOM boundaries
            detail: detail
        });
        this.dispatchEvent(event);
    }
    
    #handleSliderChange(e: Event): void {
        const element = e.target as UUISliderElement;
        const { id, value } = element;
        
        switch (id) {
            case "redSlider": this.red = Number(value); break;
            case "greenSlider": this.green = Number(value); break;
            case "blueSlider": this.blue = Number(value); break;
            case "brightnessSlider": this.brightness = Number(value); break;
            case "contrastSlider": this.contrast = Number(value); break;
            case "exposureSlider": this.exposure = Number(value); break;
            default: break;
        }
        
        //Throttle dispatching event
        if(this.#eventThrottleTimer) return;

        this.#eventThrottleTimer = setTimeout(() => {
            this.#eventThrottleTimer = null;
            this.#dispatchSliderChange();
        }, 400);

    }
    #dispatchSliderChange(): void {
        const values: SliderValues = {
            red: this.red,
            green: this.green,
            blue: this.blue,
            brightness: this.brightness,
            contrast: this.contrast,
            exposure: this.exposure
        };
        
        this.#dispatchEvent("slider-values-change", values);
    }
    
    #setRotation(value: number): void {
        this.rotationAdjustment = value;
        this.#dispatchEvent("rotate", this.rotationAdjustment);
    }
    #dispatchRotate(e: Event){
        const element = e.target as UUISliderElement;
        this.rotationAdjustment = Number(element.value); 
        this.#dispatchEvent("rotate", this.rotationAdjustment);
    }
    #resetSliders(){
        this.red = 0;
        this.green = 0;
        this.blue = 0;
        this.brightness = 0;
        this.contrast = 0;
        this.exposure = 1;
        this.rotationAdjustment = 0;
    }
    #dispatchApplyChanges(){
        this.#closePopupMenu(this.adjustPopover);
        this.#closePopupMenu(this.rotatePopover);
        this.#dispatchEvent("apply-changes");
        this.#resetSliders();
    }
    #dispatchDiscardChanges(){
        this.#closePopupMenu(this.adjustPopover);
        this.#closePopupMenu(this.rotatePopover);
        this.#dispatchEvent("discard-changes");
        this.#resetSliders();
    }
    
    #openPopupMenu(popover: UUIPopoverContainerElement ){
        this.menuOpen = true;
        popover.showPopover();
    }
    
    #closePopupMenu(popover: UUIPopoverContainerElement ){
        this.menuOpen = false;
        popover.hidePopover();
    }
    
    #handleCropClick(){
        if(this.menuOpen){
            this.#closePopupMenu(this.cropPopover);
            this.#dispatchEvent("disable-cropping");
        }
        else{
            this.#openPopupMenu(this.cropPopover);
            this.#dispatchEvent("enable-cropping");
        } 
    }

    #dispatchApplyCrop(){
        this.#closePopupMenu(this.cropPopover);
        this.#dispatchEvent("apply-crop");
    }
    
    #dispatchDiscardCrop(){
        this.#closePopupMenu(this.cropPopover);
        this.#dispatchEvent("discard-crop");
    }
    
    

    render() {
        return html`
            <mediatools-icon-registry>
                <div class="centeredRow">

                    <uui-button-group>
                        <!-- CROP BUTTON -->
                        <uui-button title="Crop" label="Crop"
                                    look="primary" color="default"
                                    popovertarget="crop-popover"
                                    .disabled="${this.menuOpen}"
                                    @click = "${this.#handleCropClick}">
                            <uui-icon name="crop"></uui-icon>
                        </uui-button>
    
                        <!-- FLIP VERTICAL BUTTON -->
                        <uui-button title="Flip vertically" label="Flip vertically"
                                    look="primary" color="default"
                                    .disabled="${this.menuOpen}"
                                    @click = "${() => this.#dispatchEvent("flip-vertically")}"">
                            <uui-icon name="flip-vertical"></uui-icon>
                        </uui-button>
    
                        <!-- FLIP HORIZONTAL BUTTON-->
                        <uui-button title="Flip horizontally" label="Flip horizontally"
                                    look="primary" color="default"
                                    .disabled="${this.menuOpen}"
                                    @click = "${() => this.#dispatchEvent("flip-horizontally")}">
                            <uui-icon name="flip-horizontal"></uui-icon>
                        </uui-button>
    
                        <!-- ROTATE BUTTON-->
                        <uui-button title="Rotate" label="Rotate"
                                    look="primary" color="default"
                                    popovertarget="rotate-popover"
                                    .disabled="${this.menuOpen}"
                                    @click="${() => this.#openPopupMenu(this.rotatePopover)}">
                            <uui-icon name="rotate"></uui-icon>
                        </uui-button>
                            
                        <!-- ADJUST  BUTTON -->
                        <uui-button title="Adjust parameters" label="Adjust parameters"
                                    look="primary" color="default"
                                    popovertarget="adjust-popover"
                                    .disabled="${this.menuOpen}"
                                    @click="${() => this.#openPopupMenu(this.adjustPopover)}">
                            <uui-icon name="adjust"></uui-icon>
                        </uui-button>
    
                        <!-- UNDO BUTTON -->
                        <uui-button title="Undo changes" label="Undo changes"
                                    look="primary" color="default"
                                    .disabled="${this.menuOpen}"
                                    @click = "${() => this.#dispatchEvent("undo")}">
                            <uui-icon name="undo"></uui-icon>
                        </uui-button>
    
                        <!-- REDO BUTTON-->
                        <uui-button title="Redo changes" label="Redo changes"
                                    look="primary" color="default"
                                    .disabled="${this.menuOpen}"
                                    @click = "${() => this.#dispatchEvent("redo")}">
                            <uui-icon name="redo"></uui-icon>
                        </uui-button>
                        
                        <!-- SAVE BUTTON -->
                        <uui-button title="Save image" label="Save image"
                                    look="primary" color="positive"
                                    .disabled="${this.menuOpen}"
                                    @click = "${() => this.#dispatchEvent("save-image")}">
                            <uui-icon name="save"></uui-icon>
                        </uui-button>
               
                        <!-- EXIT BUTTON -->
                        <uui-button title="Exit" label="Exit"
                                    look="primary" color="danger" 
                                    @click = "${() => this.#dispatchEvent("exit-click")}">
                            <uui-icon name="exit"></uui-icon>
                        </uui-button>
                    </uui-button-group>
                </div>
                
                <!-- ADJUST POPOVER -->
                <uui-popover-container id="adjust-popover" placement="top" margin="10" popover="manual">
                    <uui-box class="popoverLayout" >
                        <uui-label slot="header">Adjustments</uui-label>
                        
                        <div slot="header-actions" class="centeredRow">
                            
                            <uui-button-group>
                                <uui-button title="Apply changes" label="Apply changes"
                                            pristine="" look="primary" color="positive"
                                            style="font-size: 10px"
                                            @click="${this.#dispatchApplyChanges}">
                                    <uui-icon name="checkmark"></uui-icon>
                                </uui-button>
                                
                                <uui-button title="Discard changes" label="Discard changes"
                                            pristine="" look="primary" color="danger" 
                                            style="font-size: 10px"
                                            @click="${this.#dispatchDiscardChanges}">
                                    <uui-icon name="cross"></uui-icon>
                                </uui-button>
                            </uui-button-group>

                        </div>

                        <div class="centeredRow"  style="gap: 2rem">
                            <div>
                                <div class="centeredRow">
                                    <uui-icon title="Brightness" name="brightness" style="margin-bottom: 1.7rem;"></uui-icon>
                                    <uui-slider id="brightnessSlider" label="Brightness"
                                                min="-255" max="255" step="1"
                                                value="${this.brightness}"
                                                @input="${this.#handleSliderChange}"
                                                @change="${this.#dispatchSliderChange}">
                                    </uui-slider>
                                </div>
    
                                <div class="centeredRow">
                                    <uui-icon title="Contrast" name="contrast" style="margin-bottom: 1.7rem;"></uui-icon>
                                    <uui-slider id="contrastSlider" label="Contrast"
                                                min="-100" max="100" step="1"
                                                value="${this.contrast}"
                                                @input="${this.#handleSliderChange}"
                                                @change="${this.#dispatchSliderChange}">
                                    </uui-slider>
                                </div>
    
                                <div class="centeredRow" style="margin-bottom: -1rem">
                                    <uui-icon title="Exposure" name="exposure" style="margin-bottom: 1.7rem;"></uui-icon>
                                    <uui-slider id="exposureSlider" label="Exposure"
                                                min="0.2" max="2" step="0.1"
                                                value="${this.exposure}"
                                                @input="${this.#handleSliderChange}"
                                                @change="${this.#dispatchSliderChange}">
                                    </uui-slider>
                                </div>
                            </div> 
                            
                            <div>
                                <div class="centeredRow">
                                    <div title="Red component" class="colorDot" style="background-color: red"></div>
                                    <uui-slider id="redSlider" label="Red component"
                                                min="-255" max="255" step="1"
                                                value="${this.red}"
                                                @input="${this.#handleSliderChange}"
                                                @change="${this.#dispatchSliderChange}">
                                    </uui-slider>
                                </div>

                                <div class="centeredRow">
                                    <div title="Green component" class="colorDot" style="background-color: green"></div>
                                    <uui-slider id="greenSlider" label="Green component"
                                                min="-255" max="255" step="1"
                                                value="${this.green}"
                                                @input="${this.#handleSliderChange}"
                                                @change="${this.#dispatchSliderChange}">
                                    </uui-slider>
                                </div>

                                <div class="centeredRow" style="margin-bottom: -1rem">
                                    <div title="Blue component" class="colorDot" style="background-color: blue"></div>
                                    <uui-slider id="blueSlider" label="Blue component"
                                                min="-255" max="255" step="1"
                                                value="${this.blue}"
                                                @input="${this.#handleSliderChange}"
                                                @change="${this.#dispatchSliderChange}">
                                    </uui-slider>
                                </div>

                            </div>
                        </div>
   
                    </uui-box>
                </uui-popover-container>

                <!-- CROP POPOVER -->
                <uui-popover-container id="crop-popover" placement="top" margin="10" popover="manual" >
                    <uui-box class="popoverLayout" style="padding-bottom: -20px">
                        <uui-label slot="header">Crop</uui-label>
                        <div class="centeredRow" >
                            <uui-button-group>
                                <uui-button title="Apply changes" label="Apply changes"
                                            pristine="" look="primary" color="positive"
                                            style="font-size: 10px"
                                            @click="${this.#dispatchApplyCrop}">
                                    <uui-icon name="checkmark"></uui-icon>
                                </uui-button>
    
                                <uui-button title="Discard changes" label="Discard changes"
                                            pristine="" look="primary" color="danger"
                                            style="font-size: 10px"
                                            @click="${this.#dispatchDiscardCrop}">
                                    <uui-icon name="cross"></uui-icon>
                                </uui-button>
                            </uui-button-group>
                        </div>
                    </uui-box>
                </uui-popover-container>
                
                <!-- ROTATE POPOVER -->
                <uui-popover-container id="rotate-popover" placement="top" margin="10" popover="manual" >
                    <uui-box class="popoverLayout" >
                        <uui-label slot="header">Rotation</uui-label>
                        
                        <uui-button-group slot="header-actions">
                            <uui-button title="Apply changes" label="Apply changes"
                                        pristine="" look="primary" color="positive"
                                        style="font-size: 10px"
                                        @click="${this.#dispatchApplyChanges}">
                                <uui-icon name="checkmark"></uui-icon>
                            </uui-button>
                            
                            <uui-button title="Discard changes" label="Discard changes"
                                        pristine="" look="primary" color="danger" 
                                        style="font-size: 10px"
                                        @click="${this.#dispatchDiscardChanges}">
                                <uui-icon name="cross"></uui-icon>
                            </uui-button>
                        </uui-button-group>


                        <uui-button-group style="margin-top: -0.5rem; margin-bottom: 1.5rem;" >
                            <uui-button title="Rotate left 90" label="Rotate left 90"
                                        pristine="" look="secondary" color="default"
                                        @click="${() => this.#setRotation(-90)}"> -90°
                            </uui-button>

                            <uui-button title="Rotate left 45" label="Rotate left 45"
                                        pristine="" look="secondary" color="default"
                                        @click="${() => this.#setRotation(-45)}"> -45°
                            </uui-button>

                            <uui-button title="Rotate to 0" label="Rotate to 0"
                                        pristine="" look="secondary" color="default"
                                        @click="${() => this.#setRotation(0)}"> 0°
                            </uui-button>

                            <uui-button title="Rotate right 45" label="Rotate right 45"
                                        pristine="" look="secondary" color="default"
                                        @click="${() => this.#setRotation(45)}"> 45°
                            </uui-button>

                            <uui-button title="Rotate right 90" label="Rotate right 90"
                                        pristine="" look="secondary" color="default"
                                        @click="${() => this.#setRotation(90)}"> 90°
                            </uui-button>
                        </uui-button-group>

                        <div class="centeredRow" style="margin-bottom: -1rem">
                            <uui-slider id="rotationSlider" label="Rotation"
                                        min="-360" max="360" step="1"
                                        value="${this.rotationAdjustment}"
                                        @input="${this.#dispatchRotate}">
                            </uui-slider>
                        </div>

                    </uui-box>
                </uui-popover-container>
                
                
            </mediatools-icon-registry>
        `
    }

    static styles = css`
        
        .centeredRow{
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 0;
        }
        
        .colorDot{
            display: inline-block;
            width: 1rem;
            height: 1rem;
            border-radius: 25%;
            margin-bottom: 1.7rem;
        }
        
        #adjust-popover {
            width: 32rem;
        }

        #save-popover {
            width: 20rem;
        }
    `
}

export default ImageEditorTools;

declare global {
    interface HtmlElementTagNameMap {
        'editor-tools-panel': ImageEditorTools
    }
}

