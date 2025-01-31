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
    
    #selectedSaveMethod: SavingMethod = "overwrite"; 
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

        if(this.#selectedSaveMethod == "new"){
            this.#dispatchEvent("save-image", this.#selectedExtension);    
        }
        else if(this.#selectedSaveMethod == "overwrite"){
            this.#dispatchEvent("replace-image", this.#selectedExtension);
        }

        this.#closeDialog();
    }

    #changeSelectedSavingMethod(buttonId: string, value: SavingMethod){
        const buttonGroup = this.shadowRoot?.querySelector("#saveTypeGroup");
        if(!buttonGroup) return;

        for(const button of buttonGroup.children){
            button.setAttribute("look","secondary");
        }

        const selector = "#" + buttonId;
        const selectedButton = this.shadowRoot?.querySelector(selector);

        if(selectedButton){
            selectedButton.setAttribute("look","primary");
            this.#selectedSaveMethod = value;
        }

        //Re-render view
        this.requestUpdate();
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

            <uui-dialog-layout id="dialogLayout" headline="How would you like to save your image?">
                
                <uui-label style="display: block;margin-top: 1rem; margin-bottom: 0.5rem">Replace old image or create new one?</uui-label>
                
                <uui-button-group id="saveTypeGroup" style="margin-bottom: 1rem;">

                    <uui-button id="overwriteBtn" look="primary" color="default"
                                @click="${() => this.#changeSelectedSavingMethod("overwriteBtn", "overwrite")}">Replace
                    </uui-button>

                    <uui-button id="newImgBtn" look="secondary" color="default"
                                @click="${() => this.#changeSelectedSavingMethod("newImgBtn", "new")}">Create new
                    </uui-button>
                    
                </uui-button-group>
                
                <uui-label style="display: block; margin-bottom: 0.5rem">You can change how image should be saved.</uui-label>
                
                <uui-button-group id="extensionButtons" style="margin-bottom: 1rem;">

                    <uui-button id="noChangeBtn" look="primary" color="default"
                                @click="${() => this.#changeSelectedExtension("noChangeBtn", undefined)}">Keep old
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

