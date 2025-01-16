import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, query, state, property } from "@umbraco-cms/backoffice/external/lit";
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
@customElement('canvas-tools-panel')
export class CanvasToolsPanel extends UmbElementMixin(LitElement) {

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
        this.#closeAdjustmentsMenu();
        this.#closeRotationMenu();
        this.#dispatchEvent("apply-changes");
        this.#resetSliders();
    }
    #dispatchDiscardChanges(){
        
        this.#closeAdjustmentsMenu();
        this.#closeRotationMenu();
        this.#dispatchEvent("discard-changes");
        this.#resetSliders();
    }
    
    #openAdjustmentsMenu(){
        this.menuOpen = true;
        this.adjustPopover.showPopover();
    }
    #closeAdjustmentsMenu(){
        this.menuOpen = false;
        this.adjustPopover.hidePopover();
    }

    #openRotationMenu(){
        this.menuOpen = true;
        this.rotatePopover.showPopover();
    }
    #closeRotationMenu(){
        this.menuOpen = false;
        this.rotatePopover.hidePopover();
    }
    
    
    #handleCropClick(){
        if(this.menuOpen){
            this.#closeCropMenu();
            this.#dispatchEvent("disable-cropping");
        }
        else{
            this.#openCropMenu();
            this.#dispatchEvent("enable-cropping");
        } 
    }
    #openCropMenu(){
        this.menuOpen = true;
        this.cropPopover.showPopover();
    }
    
    #closeCropMenu(){
        this.menuOpen = false;
        this.cropPopover.hidePopover();
    }
    
    #dispatchApplyCrop(){
        this.#closeCropMenu();
        this.#dispatchEvent("apply-crop");
    }
    
    #dispatchDiscardCrop(){
        this.#closeCropMenu();
        this.#dispatchEvent("discard-crop");
    }
    
    

    render() {
        return html`
            <mediatools-icon-registry>
                <div class="centeredRow">

                    <!-- CROP -->
                    <uui-button title="Crop" label="Crop"
                                look="secondary" color="default"
                                popovertarget="crop-popover"
                                .disabled="${this.menuOpen}"
                                @click = "${this.#handleCropClick}">
                        <uui-icon name="crop"></uui-icon>
                    </uui-button>

                    <!-- CROP POPOVER -->
                    <uui-popover-container id="crop-popover" placement="top" margin="10" popover="manual" >
                        <uui-box class="popoverLayout" style="padding-bottom: -20px">
                            <div class="centeredRow" style="gap: 0.5rem">
                                <uui-button title="Apply changes" label="Apply changes"
                                            pristine="" look="secondary" color="positive"
                                            style="font-size: 10px"
                                            @click="${this.#dispatchApplyCrop}">
                                    <uui-icon name="checkmark"></uui-icon>
                                </uui-button>

                                <uui-button title="Discard changes" label="Discard changes"
                                            pristine="" look="secondary" color="danger"
                                            style="font-size: 10px"
                                            @click="${this.#dispatchDiscardCrop}">
                                    <uui-icon name="cross"></uui-icon>
                                </uui-button>
                            </div>
                        </uui-box>
                    </uui-popover-container>

                    <!-- FLIP VERTICAL -->
                    <uui-button title="Flip vertically" label="Flip vertically"
                                look="secondary" color="default"
                                .disabled="${this.menuOpen}"
                                @click = "${() => this.#dispatchEvent("flip-vertically")}"">
                        <uui-icon name="flip-vertical"></uui-icon>
                    </uui-button>

                    <!-- FLIP HORIZONTAL -->
                    <uui-button title="Flip horizontally" label="Flip horizontally"
                                look="secondary" color="default"
                                .disabled="${this.menuOpen}"
                                @click = "${() => this.#dispatchEvent("flip-horizontally")}">
                        <uui-icon name="flip-horizontal"></uui-icon>
                    </uui-button>

                    <!-- ROTATE -->
                    <uui-button title="Rotate" label="Rotate"
                                look="secondary" color="default"
                                popovertarget="rotate-popover"
                                .disabled="${this.menuOpen}"
                                @click="${this.#openRotationMenu}">
                        <uui-icon name="rotate"></uui-icon>
                    </uui-button>

                    <!-- ROTATE POPOVER -->
                    <uui-popover-container id="rotate-popover" placement="top" margin="10" popover="manual" >
                        <uui-box class="popoverLayout" >
                            <uui-label slot="header">Rotation</uui-label>
                            
                            <div slot="header-actions" class="centeredRow" style="gap: 0.5rem">
                                <uui-button title="Apply changes" label="Apply changes"
                                            pristine="" look="secondary" color="positive"
                                            style="font-size: 10px"
                                            @click="${this.#dispatchApplyChanges}">
                                    <uui-icon name="checkmark"></uui-icon>
                                </uui-button>
                                
                                <uui-button title="Discard changes" label="Discard changes"
                                            pristine="" look="secondary" color="danger" 
                                            style="font-size: 10px"
                                            @click="${this.#dispatchDiscardChanges}">
                                    <uui-icon name="cross"></uui-icon>
                                </uui-button>
                            </div>


                            <div class="centeredRow" style="margin-bottom: -1rem">
                                <uui-slider id="rotationSlider" label="Rotation"
                                            min="-360" max="360" step="1"
                                            value="${this.rotationAdjustment}"
                                            @input="${this.#dispatchRotate}">
                                </uui-slider>
                            </div>
                        </uui-box>
                    </uui-popover-container>

                    <!-- ADJUST -->
                    <uui-button title="Adjust parameters" label="Adjust parameters"
                                look="secondary" color="default"
                                popovertarget="adjust-popover"
                                .disabled="${this.menuOpen}"
                                @click="${this.#openAdjustmentsMenu}">
                        <uui-icon name="adjust"></uui-icon>
                    </uui-button>

                    <!-- UNDO -->
                    <uui-button title="Undo changes" label="Undo changes"
                                look="secondary" color="default"
                                .disabled="${this.menuOpen}"
                                @click = "${() => this.#dispatchEvent("undo")}">
                        <uui-icon name="undo"></uui-icon>
                    </uui-button>

                    <!-- REDO -->
                    <uui-button title="Redo changes" label="Redo changes"
                                look="secondary" color="default"
                                .disabled="${this.menuOpen}"
                                @click = "${() => this.#dispatchEvent("redo")}">
                        <uui-icon name="redo"></uui-icon>
                    </uui-button>
                    
                    <!-- SAVE -->
                    <uui-button title="Save image" label="Save image"
                                look="secondary" color="positive"
                                .disabled="${this.menuOpen}"
                                @click = "${() => this.#dispatchEvent("save-click")}">
                        <uui-icon name="save"></uui-icon>
                    </uui-button>
           
                    <!-- EXIT -->
                    <uui-button title="Exit" label="Exit"
                                look="secondary" color="danger" 
                                @click = "${() => this.#dispatchEvent("exit-click")}">
                        <uui-icon name="exit"></uui-icon>
                    </uui-button>
                    
                </div>
                    <!-- ADJUST POPOVER -->
                    <uui-popover-container id="adjust-popover" placement="top" margin="10" popover="manual" >
                        <uui-box class="popoverLayout" >
                            <uui-label slot="header">Adjustments</uui-label>
                            
                            <div slot="header-actions" class="centeredRow" style="gap: 0.5rem">
                                
                                <uui-button title="Apply changes" label="Apply changes"
                                            pristine="" look="secondary" color="positive"
                                            style="font-size: 10px"
                                            @click="${this.#dispatchApplyChanges}">
                                    <uui-icon name="checkmark"></uui-icon>
                                </uui-button>
                                
                                <uui-button title="Discard changes" label="Discard changes"
                                            pristine="" look="secondary" color="danger" 
                                            style="font-size: 10px"
                                            @click="${this.#dispatchDiscardChanges}">
                                    <uui-icon name="cross"></uui-icon>
                                    
                                </uui-button>

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
        
        #rotate-popover {
            width: 20rem;
        }
    `
}

export default CanvasToolsPanel;

declare global {
    interface HtmlElementTagNameMap {
        'canvas-tools-panel': CanvasToolsPanel
    }
}

