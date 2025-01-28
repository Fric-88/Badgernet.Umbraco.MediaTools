import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, query, TemplateResult, state} from "@umbraco-cms/backoffice/external/lit";
import { UUIModalContainerElement, UUIModalDialogElement } from "@umbraco-cms/backoffice/external/uui";


@customElement('save-image-dialog')
export class SaveImageDialog extends UmbElementMixin(LitElement) {

    @state() dialogTemplate!: TemplateResult;
    @query("#dialogContainer") container!: UUIModalContainerElement;
    @query("#innerDialog") dialog!: UUIModalDialogElement;

    #saveFunc: (() => void) | undefined;
    #cancelFunc: (() => void) | undefined;

    #closeDialog(){
        const dialog = this.dialog as UUIModalDialogElement;
        dialog.close();
        this.dialogTemplate = html``;
    }

    #okAction(){

        this.#closeDialog();

        if(this.#saveFunc){
            this.#saveFunc(); //Run the job if defined
        }
    }

    #cancelAction(){
        this.#closeDialog();

        if(this.#cancelFunc){
            this.#cancelFunc(); //Run the job if defined
        }
    }

    public openDialog(saveFunc?: () => void, cancelFunc?: () => void): void{
        this.#saveFunc = saveFunc;
        this.#cancelFunc = cancelFunc;

        this.dialogTemplate = html`
        <uui-modal-dialog id="innerDialog">

            <uui-dialog-layout headline="Save image">
                
                <p>How do you want to save the image?</p>
                
                <div class="buttonRow">
                    <uui-button>Webp</uui-button>
                    <uui-button>Jpeg</uui-button>
                    <uui-button>Png</uui-button>
                    <uui-button>Dont change</uui-button>
                </div>

                <uui-button slot="actions" label="Cancel" 
                            look="primary" color="default" 
                            @click="${this.#cancelAction}">Cancel
                </uui-button>
                <uui-button slot="actions" label="Save" 
                            look="primary" color="positive" 
                            @click="${this.#okAction}">Save
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
    
    .buttonRow {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        gap:0;
    }

    `
}

export default SaveImageDialog;

declare global {
    interface HtmlElementTagNameMap {
        'save-image-dialog': SaveImageDialog
    }
}

