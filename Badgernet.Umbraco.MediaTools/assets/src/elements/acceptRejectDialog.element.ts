import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, query, TemplateResult, state} from "@umbraco-cms/backoffice/external/lit";
import { UUIModalContainerElement, UUIModalDialogElement } from "@umbraco-cms/backoffice/external/uui";


@customElement('accept-reject-dialog')
export class AcceptRejectDialog extends UmbElementMixin(LitElement) {

    constructor() {
        super();
    }
    @state() dialogTemplate!: TemplateResult;  
    @query("#dialogContainer") container!: UUIModalContainerElement;
    @query("#innerDialog") dialog!: UUIModalDialogElement; 

    #okButtonText: string = "Ok";
    #cancelButtonText: string = "Cancel";
    #warningText: string = "";
    #okFunction: (() => void) | undefined;
    #cancelFunction: (() => void) | undefined;

    #closeDialog(){
        const dialog = this.dialog as UUIModalDialogElement;
        dialog.close(); 
        this.dialogTemplate = html``;
    }

    #okAction(){

        this.#closeDialog();

        if(this.#okFunction){
            this.#okFunction(); //Run the job if defined
        }
    }

    #cancelAction(){
        this.#closeDialog();

        if(this.#cancelFunction){
            this.#cancelFunction(); //Run the job if defined
        }
    }

    public showModal(headline: string, message: string, okButtonText?: string, cancelButtonText?: string, warningText?:string, okFunc?: () => void, cancelFunc?: () => void): void{
        this.#okFunction = okFunc;
        this.#cancelFunction = cancelFunc;

        if(warningText !== undefined){
            this.#warningText = warningText;
        }

        if(okButtonText !== undefined){
            this.#okButtonText = okButtonText;
        }

        if(cancelButtonText !== undefined){
            this.#cancelButtonText = cancelButtonText;
        }
        
        this.dialogTemplate = html`
        <uui-modal-dialog id="innerDialog">

            <uui-dialog-layout headline="${headline}">
                
                <p>${message}</p>

                <p class="warningMessage">${this.#warningText}</p>
                
                <uui-button slot="actions" label="${this.#cancelButtonText}" 
                            look="primary" color="default" 
                            @click="${this.#cancelAction}">${this.#cancelButtonText}
                </uui-button>
                <uui-button slot="actions" label="${this.#okButtonText}" 
                            look="primary" color="positive" 
                            @click="${this.#okAction}">${this.#okButtonText}
                </uui-button>

            </uui-dialog-layout>

        </uui-modal-dialog>
        `
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

