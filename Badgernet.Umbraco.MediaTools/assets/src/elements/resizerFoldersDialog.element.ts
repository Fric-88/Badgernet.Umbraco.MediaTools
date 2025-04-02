import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
    LitElement,
    html,
    css,
    customElement,
    query,
    TemplateResult,
    state,
} from "@umbraco-cms/backoffice/external/lit";
import { UUIModalContainerElement, UUIModalDialogElement } from "@umbraco-cms/backoffice/external/uui";
import MediatoolsContext, {MEDIA_TOOLS_CONTEXT_TOKEN} from "../context/mediatools.context.ts";
import LoadingPopup from "./imageEditor/loadingPopup.ts";
import "./imageEditor/loadingPopup.ts";


@customElement('resizer-folders-dialog')
export class ResizerFolderDialog extends UmbElementMixin(LitElement) {

    #context?: MediatoolsContext;
    @state() dialogTemplate!: TemplateResult;

    @query("#modalContainer") container!: UUIModalContainerElement;
    @query("#dialogElement") dialog!: UUIModalDialogElement;
    @query("#loadingPopup") loadingPopup!: LoadingPopup;

    constructor() {
        super();
        this.consumeContext(MEDIA_TOOLS_CONTEXT_TOKEN,(_context) =>{
            this.#context = _context;
        });
    }

    connectedCallback(): void {
        super.connectedCallback();
    }

    public async showPreview(){
        if(!this.#context) return;
    }

    #closePreview(){
        const dialog = this.dialog as UUIModalDialogElement;
        dialog.close();
        this.dialogTemplate = html``;
    }

    #renderList(){
        this.dialogTemplate = html`
            <uui-modal-dialog id="dialogElement">
                <uui-dialog-layout class="layout" headline="Preview">
                    

                    THIS IS THE POPUP LAYOUT 
                    

                </uui-dialog-layout>
            </uui-modal-dialog>
        `
    }

    render() {
        return html`
            <uui-modal-container id="modalContainer" >
                ${this.dialogTemplate}
            </uui-modal-container>
            <loading-popup id="loadingPopup"></loading-popup>
        `
    }

    static styles = css`


    `
}

export default ResizerFolderDialog;

declare global {
    interface HtmlElementTagNameMap {
        'resizer-folders-dialog': ResizerFolderDialog
    }
}

