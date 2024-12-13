import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UUIRadioGroupElement } from "@umbraco-cms/backoffice/external/uui";
import { BoxEventDetail } from "../../code/box.event";


@customElement('radio-box')
export class RadioBox extends UmbElementMixin(LitElement) {

    constructor() {
        super();
    }

    @property({attribute: true}) name: string = "Name";
    @property({attribute: true}) targetProperty: string = "";
    @property({attribute: true}) description: string = "Description";    
    @property({type: Array}) options: Array<string> = [];
    @property({type: String}) selected: string = "";
    @property({attribute: true, type: Boolean}) disabled: boolean = false;

    private handleChange(e: Event){
        let target = e.target as UUIRadioGroupElement;
        
        const eventDetail: BoxEventDetail  = { targetProperty: this.targetProperty , newValue: target.value as string };
        const event = new CustomEvent<BoxEventDetail>("change", {detail: eventDetail});
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
                        <uui-radio-group name="radioOptions" .value="${this.selected}" .disabled="${this.disabled}" @change="${this.handleChange}">
                            ${this.options.map(option =>
                                html`
                                    <uui-radio style="display: inline-block;" value="${option}">${option}</uui-radio>
                                `)}
                        </uui-radio-group>
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

        uui-radio{
            margin-right: 0.5rem;
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

export default RadioBox;

declare global {
    interface HtmlElementTagNameMap {
        'radio-box': RadioBox
    }
}

