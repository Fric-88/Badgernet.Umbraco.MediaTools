import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UUIInputElement} from "@umbraco-cms/backoffice/external/uui";
import {InputType } from "@umbraco-cms/backoffice/external/uui";
import {BoxControl} from "./BoxControl.ts";


@customElement('input-box')
export class InputBox extends BoxControl{

    constructor() {
        super();
    }

    @property({attribute: true}) name: string = "Name";
    @property({attribute: true}) description: string = "";    
    @property({attribute: true, type: String }) type : InputType = "number";
    @property({attribute: true, type: Number}) min: number = 0;
    @property({attribute: true, type: Number}) step: number = 1;
    @property({attribute: true, type: String}) value: string = "";
    @property({attribute: true, type: Boolean}) disabled: boolean = false;

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
                <div id="container">
                    <div class="column">
                        <uui-label class="header">${this.name}:</uui-label>
                    </div>
                    <div class="column">
                        <uui-input
                            label="${this.name}"
                            type="${this.type}"
                            min="${this.min}"
                            step="${this.step}"
                            value="${this.value}"
                            .disabled="${this.disabled}"
                            @input="${this.handleInput}">
                        </uui-input>
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
            margin-right: 0.8rem; 
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

export default InputBox;

declare global {
    interface HtmlElementTagNameMap {
        'input-box': InputBox
    }
}

