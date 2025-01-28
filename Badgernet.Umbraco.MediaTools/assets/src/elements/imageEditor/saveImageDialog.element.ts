import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, query, TemplateResult, state} from "@umbraco-cms/backoffice/external/lit";
import {UUIButtonElement, UUIModalContainerElement, UUIModalDialogElement} from "@umbraco-cms/backoffice/external/uui";


export type ExtensionSelection = "nochange" | "webp" | "jpeg" | "png"
export type SavingMethod = "overwrite" | "new" | "download"
@customElement('save-image-dialog')
export class SaveImageDialog extends UmbElementMixin(LitElement) {

    @state() dialogTemplate!: TemplateResult;
    @query("#dialogContainer") container!: UUIModalContainerElement;
    @query("#innerDialog") dialog!: UUIModalDialogElement;

    #saveFunc: (() => void) | undefined;
    #cancelFunc: (() => void) | undefined;
    
    #selectedSaveMethod: SavingMethod; 
    #selectedExtension: ExtensionSelection; 
    
    constructor() {
        super();
        
        this.#selectedSaveMethod = "overwrite"
        this.#selectedExtension = "nochange";
    }

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
    
    #handleDownloadClick(){
        this.#selectedSaveMethod = "download";
        this.#okAction();
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

    public openDialog(saveFunc?: () => void, cancelFunc?: () => void): void{
        this.#saveFunc = saveFunc;
        this.#cancelFunc = cancelFunc;

        this.dialogTemplate = html`
        <uui-modal-dialog id="innerDialog">

            <uui-dialog-layout id="dialogLayout" headline="How would you like to save your image?">
                
                <uui-label style="display: block; margin-bottom: 0.5rem">Replace old image or create new one?</uui-label>
                <uui-button-group id="saveTypeGroup" style="margin-bottom: 1rem;">

                    <uui-button id="overwriteBtn" look="primary" color="default"
                                @click="${() => this.#changeSelectedSavingMethod("overwriteBtn", "overwrite")}">Overwrite
                    </uui-button>

                    <uui-button id="newImgBtn" look="secondary" color="default"
                                @click="${() => this.#changeSelectedSavingMethod("newImgBtn", "new")}">Create new
                    </uui-button>
                    
                </uui-button-group>
                
                <uui-label style="display: block; margin-bottom: 0.5rem">You can change how image should be saved.</uui-label>
                
                <uui-button-group id="extensionButtons" style="margin-bottom: 1rem;">

                    <uui-button id="noChangeBtn" look="primary" color="default"
                                @click="${() => this.#changeSelectedExtension("noChangeBtn", "nochange")}">Keep old
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


                <uui-button slot="actions" label="Cancel"
                            look="primary" color="danger"
                            @click="${this.#cancelAction}">Cancel
                </uui-button>
                
                <uui-button slot="actions" label="Save"
                            look="primary" color="default"
                            @click="${this.#handleDownloadClick}">Download
                </uui-button>
                
                <uui-button slot="actions" label="Save"
                            look="primary" color="default"
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

