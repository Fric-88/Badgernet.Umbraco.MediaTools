import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, query, TemplateResult, state} from "@umbraco-cms/backoffice/external/lit";
import {UUIButtonElement, UUIModalContainerElement, UUIModalDialogElement} from "@umbraco-cms/backoffice/external/uui";


export type ExtensionSelection = "webp" | "jpeg" | "png" | undefined;
export type SavingMethod = "overwrite" | "new";
@customElement('save-image-dialog')
export class SaveImageDialog extends UmbElementMixin(LitElement) {

    @state() dialogTemplate!: TemplateResult;
    @query("#dialogContainer") container!: UUIModalContainerElement;
    @query("#innerDialog") dialog!: UUIModalDialogElement;

    #saveFunc: (() => void) | undefined;
    #cancelFunc: (() => void) | undefined;
    
    #selectedExtension: ExtensionSelection = undefined;

    //Generic method for dispatching named events
    #dispatchEvent(eventName: string, detail?: any){
        const event = new CustomEvent(eventName,{
            bubbles: true,       // Allows the event to bubble up through the DOM
            composed: true,      // Allows the event to pass through shadow DOM boundaries
            detail: detail
        });
        this.dispatchEvent(event);
    }

    #closeDialog(){

        this.#dispatchEvent("dialog-closed");
        
        const dialog = this.dialog as UUIModalDialogElement;
        dialog.close();
        this.dialogTemplate = html``;

    }

    #handleSaveClick(){
        this.#dispatchEvent("save-image", this.#selectedExtension);    
        this.#closeDialog();
    }

    #changeSelectedExtension(buttonId: string, value: ExtensionSelection){
        
        const buttonGroup = this.shadowRoot?.querySelector("#extensionButtons");
        if(!buttonGroup) return; 
        
        for(const button of buttonGroup.children){
            button.setAttribute("look","secondary");
        }
        
        const selector = "#" + buttonId;
        const selectedButton = this.shadowRoot?.querySelector(selector);
        
        if(selectedButton){
            selectedButton.setAttribute("look","primary");
            this.#selectedExtension = value;
        }
        
        //Re-render view
        this.requestUpdate();
    }

    public openDialog(): void{

        this.dialogTemplate = html`
        <uui-modal-dialog id="innerDialog">

            <uui-dialog-layout id="dialogLayout">
                
                
                <h2 style="display: block; margin-bottom: 0.5rem">Save image</h2>
                <h3 style="display: block;margin-top: 1rem; margin-bottom: 1.5rem">This will overwrite the original image!</h3>


                <uui-label style="display: block; margin-bottom: 0.5rem">How should your image be encoded?</uui-label>
                
                <uui-button-group id="extensionButtons" style="margin-bottom: 1rem;">

                    <uui-button id="noChangeBtn" look="primary" color="default"
                                @click="${() => this.#changeSelectedExtension("noChangeBtn", undefined)}">Same as before
                    </uui-button>
                    
                    <uui-button id="webpBtn" look="secondary" color="default" 
                                @click="${() => this.#changeSelectedExtension("webpBtn", "webp")}">Webp
                    </uui-button>
                    
                    <uui-button id="jpegBtn" look="secondary" color="default"
                                @click="${() => this.#changeSelectedExtension("jpegBtn", "jpeg")}">Jpeg
                    </uui-button>
                    
                    <uui-button id="pngBtn" look="secondary" color="default"
                                @click="${() => this.#changeSelectedExtension("pngBtn", "png")}">Png
                    </uui-button>

                </uui-button-group>



                <div slot="actions" >
                    <uui-button label="Cancel"
                                look="primary" color="danger"
                                @click="${() => this.#closeDialog()}">Cancel
                    </uui-button>

                    <uui-button label="Save"
                                look="primary" color="default"
                                @click="${() => this.#handleSaveClick()}">Save
                    </uui-button>
                </div>
                
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

