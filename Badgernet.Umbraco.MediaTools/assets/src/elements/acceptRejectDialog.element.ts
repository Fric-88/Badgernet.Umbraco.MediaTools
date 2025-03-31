import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
    LitElement,
    html,
    css,
    customElement,
    query,
    TemplateResult,
    state,
    property, ifDefined
} from "@umbraco-cms/backoffice/external/lit";
import { UUIModalContainerElement, UUIModalDialogElement } from "@umbraco-cms/backoffice/external/uui";


@customElement('accept-reject-dialog')
export class AcceptRejectDialog extends UmbElementMixin(LitElement) {

    private resolve!: (value: boolean) => void;

    #headline: string = "Headline";
    #message: string = "Message";
    #acceptBtnText: string = "Ok";
    #rejectBtnText: string = "Cancel";
    #warningText: string = "";
    @state() dialogTemplate!: TemplateResult;

    @query("#dialogContainer") container!: UUIModalContainerElement;
    @query("#innerDialog") dialog!: UUIModalDialogElement;

    constructor() {
        super();
    }

    #closeDialog(){
        const dialog = this.dialog as UUIModalDialogElement;
        dialog.close(); 
        this.dialogTemplate = html``;
    }

    #accept(){
        this.resolve(true);
        this.#closeDialog();
    }

    #reject(){
        this.resolve(false);
        this.#closeDialog();
    }
    public build(headline: string, message: string, warning?: string, acceptBtnText?: string, rejectBtnText?: string):void {
        this.#headline = headline;
        this.#message = message;
        if(warning != null) this.#warningText = warning;
        if(acceptBtnText != null) this.#acceptBtnText = acceptBtnText;
        if(rejectBtnText != null) this.#rejectBtnText = rejectBtnText;
    }
    public async show(): Promise<boolean>{
        
        this.dialogTemplate = html`
        <uui-modal-dialog id="innerDialog">

            <uui-dialog-layout headline="${this.#headline}">
                
                <p>${this.#message}</p>
                <p class="warningMessage">${this.#warningText}</p>
                
                <uui-button slot="actions" label="${this.#rejectBtnText}" 
                            look="primary" color="default" 
                            @click="${this.#reject}">${this.#rejectBtnText}
                </uui-button>
                <uui-button slot="actions" label="${this.#acceptBtnText}" 
                            look="primary" color="positive" 
                            @click="${this.#accept}">${this.#acceptBtnText}
                </uui-button>
            </uui-dialog-layout>

        </uui-modal-dialog>
        `
        
        return new Promise((resolve) => {
            this.resolve = resolve;
        })
    }

    render() {
        return html`
            <uui-modal-container id="dialogContainer" >
                ${this.dialogTemplate}
            </uui-modal-container>
        `
    }

    static styles = css`

    .warningMessage{
        color: darkred;
    }

    .stackedButton{
        padding: 0.1rem;
        min-width: 6rem;
        float: right;
    }
    `
}

export default AcceptRejectDialog;

declare global {
    interface HtmlElementTagNameMap {
        'accept-reject-dialog': AcceptRejectDialog
    }
}

