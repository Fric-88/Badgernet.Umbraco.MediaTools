import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UUIInputElement} from "@umbraco-cms/backoffice/external/uui";
import {BoxControl} from "./BoxControl.ts";


@customElement('slider-box')
export class SliderBox extends BoxControl{

    constructor() {
        super();
    }

    @property({attribute: true}) name: string = "Name";
    @property({attribute: true}) description: string = "Description";    
    @property({attribute: true, type: Number}) min = 0;
    @property({attribute: true, type: Number}) max = 100;
    @property({attribute: true, type: Number}) step = 1;
    @property({attribute: true, type: Boolean}) hideSteps = false; 
    @property({attribute: true, type: Number}) value = 0;
    @property({attribute: true, type: Boolean}) disabled = false;

    private handleInput(e: Event){
        let target = e.target as UUIInputElement;

        //Dispatch change event
        const event = new CustomEvent("change",{
            bubbles: true,
            composed: true,
            detail: target.value
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <uui-box>
                <div id=container>
                    <div class="column">
                        <uui-label class="header">${this.name}:</uui-label>
                        
                    </div>
                    <div class="column">
                        <uui-slider 
                            style="padding-top: 0.5rem; margin-bottom: -1.5rem"
                            label="${this.name}"
                            min="${this.min}"
                            step="${this.step}"
                            ?hide-step-values="${this.hideSteps}"
                            .value="${this.value}"
                            .disabled="${this.disabled}"
                            @input="${this.handleInput}">
                        </uui-slider>
                    </div>
                </div>
                <uui-label class="muted">${this.description}</uui-label>
            </uui-box>
        `
    }

    static styles = css`


        #container{
            display: flex;
            flex-direction: row; 
        }

        .column{
            display:flex;
            flex-direction: column;
            justify-content: center;
            margin-right: 0.5rem 
            
        }
        
        .muted{
            display: block;
            font-size: 0.8rem;
            font-style: italic;
            font-weight: lighter;
        }
        .header{
            display: block;
            font-weight: bold;
        }
    `
}

export default SliderBox;

declare global {
    interface HtmlElementTagNameMap {
        'slider-box': SliderBox
    }
}

