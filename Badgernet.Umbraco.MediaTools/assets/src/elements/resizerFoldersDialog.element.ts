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
import MediaToolsContext from "../context/mediatools.context.ts";
import {MediaFolderDto} from "../api";


@customElement('resizer-folders-dialog')
export class ResizerFolderDialog extends UmbElementMixin(LitElement) {

    #context?: MediatoolsContext;
    @state() dialogTemplate!: TemplateResult;
    @state() mediaFolders: MediaFolderDto[] = [];

    @query("#modalContainer") container!: UUIModalContainerElement;
    @query("#dialogElement") dialog!: UUIModalDialogElement;
    @query("#loadingPopup") loadingPopup!: LoadingPopup;

    constructor() {
        super();

        this.consumeContext(MEDIA_TOOLS_CONTEXT_TOKEN,(_context) =>{
            this.#context = _context;
            this.observe(_context.mediaFolders, (_value) => {this.mediaFolders = _value});
        });
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.#context?.fetchMediaFolders();
    }

    public async showDialog(){
        if(!this.#context) return;
        this.#renderList();
    }

    #closeDialog(){
        const dialog = this.dialog as UUIModalDialogElement;
        dialog.close();
        this.dialogTemplate = html``;
    }

    #renderList(){
        this.dialogTemplate = html`
            <uui-modal-dialog id="dialogElement">
                <uui-dialog-layout class="layout" headline="Resizer limits for media folders">
                    <p>You can set resizer values on a "folder by folder" basis here.</p>
                    <uui-table aria-label="Filter results">

                        <uui-table-column style="width: auto;"></uui-table-column>
                        <uui-table-column style="width: 5rem;"></uui-table-column>
                        <uui-table-column style="width: 5rem;"></uui-table-column>
                        <uui-table-column style="width: 3rem;"></uui-table-column>
                        <uui-table-column style="width: auto;"></uui-table-column>


                        <uui-table-head>
                            <uui-table-head-cell>Folder</uui-table-head-cell>
                            <uui-table-head-cell>Max Width</uui-table-head-cell>
                            <uui-table-head-cell>Max Height</uui-table-head-cell>
                            <uui-table-head-cell></uui-table-head-cell>
                        </uui-table-head>



                        ${this.mediaFolders.map((folder) => html`
                            <uui-table-row>

                                <uui-table-cell >
                                        <div style="display: flex; flex-direction: column">
                                            <div style="display: flex; flex-direction: row; gap: 5px;">
                                                <uui-icon name="folder" style="font-size: 1rem; margin-top: 2px"></uui-icon>
                                                <span style="font-weight: bold">${folder.name}<span>
                                            </div>
                                            <small style="font-style: italic">${folder.path}</small>
                                        </div>
                                    </div>

                                </uui-table-cell>

                                <uui-table-cell>
                                    <uui-input></uui-input>
                                </uui-table-cell>

                                <uui-table-cell>
                                    <uui-input></uui-input>
                                </uui-table-cell>

                                <uui-table-cell>
                                    <uui-button title="Delete rule"
                                                label="delete" pristine=""
                                                look="secondary" color="danger">
                                        <uui-icon name="delete"></uui-icon>
                                    </uui-button>
                                </uui-table-cell>

                            </uui-table-row>
                        `)}

                    </uui-table>
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


