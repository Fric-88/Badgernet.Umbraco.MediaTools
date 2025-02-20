import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UUIToggleElement } from "@umbraco-cms/backoffice/external/uui";
import {BoxControl} from "./BoxControl.ts";


@customElement('toggle-box')
export class ToggleBox extends BoxControl{

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        this.label = this.checked ? "Enabled" : "Disabled"
    }

    @property({attribute: true}) name: string = "Name";
    @property({attribute: true}) description: string = "Description";    
    @property({attribute: true, type: Boolean}) checked: boolean = false;
    @property({attribute: true, type: Boolean}) disabled: boolean = false;
    @state() label: string = "default";  

    private handleClick(e: Event ){
        let target = e.target as UUIToggleElement;
        this.label = target.checked ? "Enabled" : "Disabled";

        //Dispatch change event
        const event = new CustomEvent("toggle",{
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
                    <uui-toggle 
                        label="${this.label}" 
                        label-position="right" 
                        ?checked=${this.checked} 
                        .disabled = "${this.disabled}"
                        @change="${this.handleClick}">
                    </uui-toggle>
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
            margin-bottom:0.5rem;
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
            text-align: center;
        }
        .header{
            display: block;
            font-weight: bold;
        }
    `


}

export default ToggleBox;

declare global {
    interface HtmlElementTagNameMap {
        'toggle-box': ToggleBox
    }
}

