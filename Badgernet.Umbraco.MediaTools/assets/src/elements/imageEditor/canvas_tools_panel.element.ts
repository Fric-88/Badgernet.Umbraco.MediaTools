import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, query, state, property } from "@umbraco-cms/backoffice/external/lit";
import "./icons/imageEditorIconRegistry.ts"
import {UUISliderElement} from "@umbraco-cms/backoffice/external/uui";

@customElement('canvas-tools-panel')
export class CanvasToolsPanel extends UmbElementMixin(LitElement) {


    
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

    render() {
        return html`
            <mediatools-icon-registry>
                <div class="centeredRow">

                    <uui-button look="secondary" color="default" @click = "">
                        <uui-icon name="crop"></uui-icon>
                    </uui-button>

                    <uui-button look="secondary" color="default" @click = "${() => this.#dispatchEvent("flip-vertically")}"">
                        <uui-icon name="flip-vertical"></uui-icon>
                    </uui-button>

                    <uui-button look="secondary" color="default" @click = "${() => this.#dispatchEvent("flip-horizontally")}">
                        <uui-icon name="flip-horizontal"></uui-icon>
                    </uui-button>

                    <uui-button look="secondary" color="default" @click = "">
                        <uui-icon name="rotate"></uui-icon>
                    </uui-button>

                    <uui-button popovertarget="adjust-popover" look="secondary" color="default">
                        <uui-icon name="adjust"></uui-icon>
                    </uui-button>
                    <uui-popover-container id="adjust-popover" placement="top" margin="10" >
                        <uui-box class="popoverLayout">
                            <small slot="header">Adjustments</small>
                            
                            <div class="centeredRow">
                                <uui-icon name="brightness" style="margin-bottom: 1.7rem;"></uui-icon>
                                <uui-slider id="brightnessSlider" value="0" min="-255" max="255" step="1" 
                                            @input="${() => this.#dispatchEvent("adjust-image")}">
                                </uui-slider>
                            </div>

                            <div class="centeredRow">
                                <uui-icon name="contrast" style="margin-bottom: 1.7rem;"></uui-icon>
                                <uui-slider id="contrastSlider" value="0" min="-100" max="100" step="1" 
                                            @input="${() => this.#dispatchEvent("adjust-image")}">
                                </uui-slider>
                            </div>

                            <div class="centeredRow">
                                <uui-icon name="exposure" style="margin-bottom: 1.7rem;"></uui-icon>
                                <uui-slider id="exposureSlider" value="1" min="0.2" max="2" step="0.1" 
                                            @input="${() => this.#dispatchEvent("adjust-image")}">
                                </uui-slider>
                            </div>
                            
                            <div class="centeredRow" style="gap: 0.5rem">
                                <uui-button style="flex-grow: 1" look="primary" color="danger" compact>
                                    <uui-icon name="cross"></uui-icon> 
                                </uui-button>
                                <uui-button style="flex-grow: 1" look="primary" color="positive" compact="">
                                    <uui-icon name="checkmark"></uui-icon>
                                </uui-button>
                            </div>

                        </uui-box>
                    </uui-popover-container>
                    

                    <uui-button look="secondary" color="default" @click = "${() => this.#dispatchEvent("undo")}">
                        <uui-icon name="undo"></uui-icon>
                    </uui-button>
                
                    <uui-button look="secondary" color="default" @click = "${() => this.#dispatchEvent("redo")}">
                        <uui-icon name="redo"></uui-icon>
                    </uui-button>

                    <uui-button look="secondary" color="positive" @click = "${() => this.#dispatchEvent("save-click")}">
                        <uui-icon name="save"></uui-icon>
                    </uui-button>
           
                    <uui-button look="secondary" color="danger" @click = "${() => this.#dispatchEvent("exit-click")}">
                        <uui-icon name="exit"></uui-icon>
                    </uui-button>
                    
                </div>
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
        
        .popoverLayout{
            width: 16rem;
        }
    `
}

export default CanvasToolsPanel;

declare global {
    interface HtmlElementTagNameMap {
        'canvas-tools-panel': CanvasToolsPanel
    }
}

