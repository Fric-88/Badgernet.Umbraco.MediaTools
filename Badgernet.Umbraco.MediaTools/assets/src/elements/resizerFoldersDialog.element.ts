import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
    LitElement,
    html,
    css,
    customElement,
    query,
    TemplateResult,
    state, property,
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
    
    @property({ type: String, attribute: true }) width: string = "800px"; //Default popup width
    @property({ type: String, attribute: true }) height: string = "400px"; //Default popup height

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
    
    #saveAndClose(): void {
        console.log("Saving settings");
        this.#closeDialog();
    } 

    #renderList(){
        this.dialogTemplate = html`
            <uui-modal-dialog id="dialogElement">
                <uui-dialog-layout class="layout" 
                                   headline="Resizer limits for media folders">
                    
                    <p>You can set resizer values on a "folder by folder" basis here.</p>
                    
                    <div class="scrollable" style="display: block; width: ${this.width}; height: ${this.height}">
                        <uui-table aria-label="Filter results" style="padding: 2px; width: 99%;">
    
                            <uui-table-column style="width: auto;"></uui-table-column>
                            <uui-table-column style="width: 10rem;"></uui-table-column>
                            <uui-table-column style="width: 10rem;"></uui-table-column>
                            <uui-table-column style="width: 3rem;"></uui-table-column>
                            <uui-table-column style="width: auto;"></uui-table-column>
    
    
<!--                            <uui-table-head class="sticky">
                                <uui-table-head-cell>Folder</uui-table-head-cell>
                                <uui-table-head-cell>Max Width</uui-table-head-cell>
                                <uui-table-head-cell>Max Height</uui-table-head-cell>
                                <uui-table-head-cell></uui-table-head-cell>
                            </uui-table-head>-->
    
    
    
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
                                            <small>Width</small>
                                            <uui-input></uui-input>
                                    </uui-table-cell>
    
                                    <uui-table-cell>
                                        <small>Height</small>
                                        <uui-input></uui-input>
                                    </uui-table-cell>
    
                                    <uui-table-cell>
                                        <small>Resize</small>
                                        <uui-toggle></uui-toggle>
                                    </uui-table-cell>
    
                                </uui-table-row>
                            `)}
    
                        </uui-table>
                    </div>
                    
                    <div class="buttonsBar">
                        <uui-button slot="actions" label="Metadata"
                                    look="primary" color="default"
                                    @click="${this.#saveAndClose}">Save & Close
                        </uui-button>

                        <uui-button slot="actions" label="Close"
                                    look="primary" color="default"
                                    @click="${this.#closeDialog}">Close
                        </uui-button>
                    </div>
                    
                </uui-dialog-layout>
            </uui-modal-dialog>
        `
    }

    render() {
        return html`
            
            <uui-modal-container id="modalContainer">
                ${this.dialogTemplate}
            </uui-modal-container>
            <loading-popup id="loadingPopup"></loading-popup>
        `
    }
    static styles = css`
        
        .scrollable{
            overflow-y: scroll;
        }
        
        .sticky{
            position: sticky;
            z-index: 100; /* Ensures it stays on top */
            top: 0px;
            margin: 0;
        }
        
        .buttonsBar{
            margin-top: 1rem;
        }

        uui-table{
            margin: 0;
        }

        uui-table-head{
            background-color: #F4F3F5;
            overflow: clip;
            border-radius: 10px 10px 0 0;
        }

        uui-table-cell{
            padding: 0.3rem;
        }

    `
}

export default ResizerFolderDialog;

declare global {
    interface HtmlElementTagNameMap {
        'resizer-folders-dialog': ResizerFolderDialog
    }
}


