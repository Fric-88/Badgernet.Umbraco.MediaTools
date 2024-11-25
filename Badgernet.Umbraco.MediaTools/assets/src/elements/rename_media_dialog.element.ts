import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, query, property, TemplateResult, state} from "@umbraco-cms/backoffice/external/lit";
import { UUIModalContainerElement, UUIModalDialogElement, UUIInputElement } from "@umbraco-cms/backoffice/external/uui";


@customElement('rename-media-dialog')
export class RenameMediaDialog extends UmbElementMixin(LitElement) {

    constructor() {
        super();
    }
    
    @state() dialogTemplate!: TemplateResult;
    @property() validationMessage: string = "";
    @property() mediaName: string = "";  
    
    @query("#dialogContainer") container!: UUIModalContainerElement;
    @query("#innerDialog") dialog!: UUIModalDialogElement;
    @query("#nameInput") input!: UUIInputElement; 

    #newName: string = "";
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
    
    #inputChanged(){
        const inputElement = this.input as UUIInputElement;
        this.mediaName = inputElement.value.toString();
        
        if(this.mediaName.length == 0){
            this.validationMessage = "Name is required";
        }
    }
    public showModal(oldName: string, okFunc?: () => void, cancelFunc?: () => void): void{
        this.#okFunction = okFunc;
        this.#cancelFunction = cancelFunc;
        this.mediaName = oldName;

        this.dialogTemplate = html`
        <uui-modal-dialog id="innerDialog">

            <uui-dialog-layout headline="Rename media">
                
                <uui-input id="nameInput" 
                           style="width: 300px"
                           pristine="" 
                           label="Label" 
                           value="${this.mediaName}"
                           @input="${this.#inputChanged}"></uui-input>
               
                <uui-button slot="actions" look="primary" color="default" @click="${this.#cancelAction}">Cancel</uui-button>
                <uui-button slot="actions" look="primary" color="positive" @click="${this.#okAction}">Rename</uui-button>

            </uui-dialog-layout>

        </uui-modal-dialog>
        `
    }

    render() {
        return html`
            <uui-modal-container id="dialogContainer" >
                <p class="validationMessage">${this.validationMessage}</p>
                ${this.dialogTemplate}
            </uui-modal-container>
        `
    }

    static styles = css`
        
        .validationMessage{
            color: darkred;
        }
        
        .stackedButton{
            padding: 0.1rem;
            min-width: 6rem;
            float: right;
        }
    `
}

export default RenameMediaDialog;

declare global {
    interface HtmlElementTagNameMap {
        'rename-media-dialog': RenameMediaDialog
    }
}

