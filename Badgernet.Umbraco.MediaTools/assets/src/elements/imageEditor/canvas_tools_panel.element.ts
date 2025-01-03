import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, query, state, property } from "@umbraco-cms/backoffice/external/lit";
import "./icons/imageEditorIconRegistry.ts"
import {UUIPopoverContainerElement, UUISliderElement} from "@umbraco-cms/backoffice/external/uui";

@customElement('canvas-tools-panel')
export class CanvasToolsPanel extends UmbElementMixin(LitElement) {

    @state() menuOpen: boolean = false;
    @query("#adjust-popover") adjustPopover!: UUIPopoverContainerElement;
    @query("#brightnessSlider") brightnessSlider!: UUISliderElement;
    @query("#contrastSlider") contrastSlider!: UUISliderElement;
    @query("#exposureSlider") exposureSlider!: UUISliderElement;
    
    
    
    get brightnessValue(): number{
        return Number(this.brightnessSlider.value); 
    }
    get contrastValue(): number{
        return Number(this.contrastSlider.value);
    }
    get exposureValue(): number{
        return Number(this.exposureSlider.value);
    }
    
    constructor() {
        super();
    }
    
    #dispatchEvent(eventName: string){
        const event = new Event(eventName,{
            bubbles: true,       // Allows the event to bubble up through the DOM
            composed: true// Allows the event to pass through shadow DOM boundaries
        });
        this.dispatchEvent(event);
    }
    
    #applyChanges(){
        
        //TODO RESET SLIDER VALUES
        this.#closeAdjustmentsMenu();
        this.#dispatchEvent("apply-changes");
    }
    
    #discardChanges(){
        
        //TODO RESET SLIDER VALUES
        this.#closeAdjustmentsMenu();
        this.#dispatchEvent("discard-changes");
    }
    
    #openAdjustmentsMenu(){
        this.menuOpen = true;
        this.adjustPopover.showPopover();
    }
    #closeAdjustmentsMenu(){
        this.menuOpen = false;
        this.adjustPopover.hidePopover();
    }

    render() {
        return html`
            <mediatools-icon-registry>
                <div class="centeredRow">

                    <uui-button look="secondary" color="default"
                                .disabled="${this.menuOpen}"
                                @click = "">
                        <uui-icon name="crop"></uui-icon>
                    </uui-button>

                    <uui-button look="secondary" color="default"
                                .disabled="${this.menuOpen}"
                                @click = "${() => this.#dispatchEvent("flip-vertically")}"">
                        <uui-icon name="flip-vertical"></uui-icon>
                    </uui-button>

                    <uui-button look="secondary" color="default"
                                .disabled="${this.menuOpen}"
                                @click = "${() => this.#dispatchEvent("flip-horizontally")}">
                        <uui-icon name="flip-horizontal"></uui-icon>
                    </uui-button>

                    <uui-button look="secondary" color="default"
                                .disabled="${this.menuOpen}"
                                @click = "">
                        <uui-icon name="rotate"></uui-icon>
                    </uui-button>

                    <uui-button look="secondary" color="default"
                                popovertarget="adjust-popover"
                                .disabled="${this.menuOpen}"
                                @click="${this.#openAdjustmentsMenu}">
                        <uui-icon name="adjust"></uui-icon>
                    </uui-button>
                    
                    <uui-button look="secondary" color="default"
                                .disabled="${this.menuOpen}"
                                @click = "${() => this.#dispatchEvent("undo")}">
                        <uui-icon name="undo"></uui-icon>
                    </uui-button>
                
                    <uui-button look="secondary" color="default"
                                .disabled="${this.menuOpen}"
                                @click = "${() => this.#dispatchEvent("redo")}">
                        <uui-icon name="redo"></uui-icon>
                    </uui-button>

                    <uui-button look="secondary" color="positive"
                                .disabled="${this.menuOpen}"
                                @click = "${() => this.#dispatchEvent("save-click")}">
                        <uui-icon name="save"></uui-icon>
                    </uui-button>
           
                    <uui-button look="secondary" color="danger" @click = "${() => this.#dispatchEvent("exit-click")}">
                        <uui-icon name="exit"></uui-icon>
                    </uui-button>
                    
                </div>
                
                
                    <uui-popover-container id="adjust-popover" placement="top" margin="10" popover="manual" >
                        <uui-box class="popoverLayout" >
                            <uui-label slot="header">Adjustments</uui-label>
                            
                            <div slot="header-actions" class="centeredRow" style="gap: 0.5rem">
                                <uui-button pristine="" label="Cancel" look="secondary" color="danger" 
                                            style="font-size: 10px"
                                            @click="${this.#discardChanges}">
                                    <uui-icon name="cross"></uui-icon>
                                    
                                </uui-button>
                                <uui-button pristine="" label="Apply" look="secondary" color="positive" 
                                            style="font-size: 10px"
                                            @click="${this.#applyChanges}">
                                    <uui-icon name="checkmark"></uui-icon>
                                </uui-button>
                            </div>

                            <div class="centeredRow"  style="gap: 2rem">
                                <div>
                                    <div class="centeredRow">
                                        <uui-icon name="brightness" style="margin-bottom: 1.7rem;"></uui-icon>
                                        <uui-slider id="brightnessSlider" value="0" min="-255" max="255" step="1" 
                                                    @change="${() => this.#dispatchEvent("preview-adjustments")}">
                                        </uui-slider>
                                    </div>
        
                                    <div class="centeredRow">
                                        <uui-icon name="contrast" style="margin-bottom: 1.7rem;"></uui-icon>
                                        <uui-slider id="contrastSlider" value="0" min="-100" max="100" step="1" 
                                                    @change="${() => this.#dispatchEvent("preview-adjustments")}">
                                        </uui-slider>
                                    </div>
        
                                    <div class="centeredRow" style="margin-bottom: -1rem">
                                        <uui-icon name="exposure" style="margin-bottom: 1.7rem;"></uui-icon>
                                        <uui-slider id="exposureSlider" value="1" min="0.2" max="2" step="0.1"
                                                    @change="${() => this.#dispatchEvent("preview-adjustments")}">
                                        </uui-slider>
                                    </div>
                                </div> 
                                
                                <div>
                                    <div class="centeredRow">
                                        <div class="colorDot" style="background-color: red"></div>
                                        <uui-slider id="brightnessSlider" value="0" min="-10" max="10" step="1"
                                                    @change="">
                                        </uui-slider>
                                    </div>

                                    <div class="centeredRow">
                                        <div class="colorDot" style="background-color: green"></div>
                                        <uui-slider id="contrastSlider" value="0" min="-10" max="10" step="1"
                                                    @change="">
                                        </uui-slider>
                                    </div>

                                    <div class="centeredRow" style="margin-bottom: -1rem">
                                        <div class="colorDot" style="background-color: blue"></div>
                                        <uui-slider id="exposureSlider" value="0" min="-10" max="10" step="1"
                                                    @change="">
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

        .popoverLayout{
            width: 32rem;
        }
    `
}

export default CanvasToolsPanel;

declare global {
    interface HtmlElementTagNameMap {
        'canvas-tools-panel': CanvasToolsPanel
    }
}

