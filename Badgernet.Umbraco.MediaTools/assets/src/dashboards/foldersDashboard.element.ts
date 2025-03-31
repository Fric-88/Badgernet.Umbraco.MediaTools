import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, state, query } from "@umbraco-cms/backoffice/external/lit";
import MediaToolsContext, { MEDIA_TOOLS_CONTEXT_TOKEN } from "../context/mediatools.context";
import {
    UUICheckboxElement,
    UUIPaginationElement, UUISelectElement,
    UUITableCellElement,
    UUITableRowElement,
    UUIToastNotificationContainerElement,
    UUIToastNotificationElement
} from "@umbraco-cms/backoffice/external/uui";
import {
    FilterGalleryData,
    ImageMediaDto,
    MediaFolderDto,
    OperationResponse,
    ProcessImagesData,
    RenameMediaData
} from "../api";
import { SelectablePagedList } from "../code/pagedList";
import "../elements/galleryToolsPanel.element.ts";
import ProcessImagePanel, { ProcessingSettings } from "../elements/galleryToolsPanel.element.ts";
import ImagePreview from "../elements/imagePreview.element.ts";
import "../elements/imagePreview.element.ts"
import GallerySearchBar from "../elements/gallerySearchBar.element.ts";
import "../elements/gallerySearchBar.element.ts"
import RenameMediaDialog from "../elements/renameMediaDialog.element.ts";
import "../elements/renameMediaDialog.element.ts"
import ImageEditorDialog from "../elements/imageEditorDialog.element.ts";
import "../elements/imageEditorDialog.element.ts"
import AcceptRejectDialog from "../elements/acceptRejectDialog.element.ts";
import "../elements/acceptRejectDialog.element.ts"
import FoldersDashboardElement from "./foldersDashboard.element.ts";



@customElement('badgernet_umbraco_mediatools-folders_dashboard')
export class FoldersDashboard extends UmbElementMixin(LitElement) {

    #mediaToolsContext?: MediaToolsContext;
    @state() mediaFolders?: MediaFolderDto[];  
    
    constructor() {
        super();

        this.consumeContext(MEDIA_TOOLS_CONTEXT_TOKEN,(_context) =>{
            this.#mediaToolsContext = _context;
            this.observe(_context.mediaFolders, (_value) => {this.mediaFolders = _value});
        });
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.#mediaToolsContext?.fetchMediaFolders()
            .catch(()=>{
                console.log("Something went wrong fetching media folders");
            });
    }
    
    render() {
        return html`
            <div class="dashboard">
                <uui-box>
                    <div slot="headline">
                        <uui-label >📁 Folder rules</uui-label>
                        <uui-label class="muted" >You can override how media should process.</uui-label>
                    </div>
    
                    <uui-button slot="header-actions" label="Add rule" color="positive" look="primary">Add rule</uui-button>

                    <uui-table aria-label="Filter results">

                        <uui-table-column style="width: auto;"></uui-table-column>
                        <uui-table-column style="width: 1rem;"></uui-table-column>
                        <uui-table-column style="width: 3rem;"></uui-table-column>
                        <uui-table-column style="width: 3rem;"></uui-table-column>
                        <uui-table-column style="width: 1rem;"></uui-table-column>
                        <uui-table-column style="width: 12rem;"></uui-table-column>
                        <uui-table-column style="width: 12rem;"></uui-table-column>
                        <uui-table-column style="width: 1rem;"></uui-table-column>

                        <uui-table-head>
                            <uui-table-head-cell>Folder path</uui-table-head-cell>
                            <uui-table-head-cell>Resize</uui-table-head-cell>
                            <uui-table-head-cell>Max Width</uui-table-head-cell>
                            <uui-table-head-cell>Max Height</uui-table-head-cell>
                            <uui-table-head-cell>Convert</uui-table-head-cell>
                            <uui-table-head-cell>Mode</uui-table-head-cell>
                            <uui-table-head-cell>Quality</uui-table-head-cell>
                            <uui-table-head-cell></uui-table-head-cell>
                        </uui-table-head>
                        
                        
                        
                        ${this.mediaFolders?.map((folder) => html`
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
                                    <uui-toggle></uui-toggle>
                                </uui-table-cell>

                                <uui-table-cell>
                                    <uui-input></uui-input>
                                </uui-table-cell>

                                <uui-table-cell>
                                    <uui-input></uui-input>
                                </uui-table-cell>

                                <uui-table-cell>
                                    <uui-toggle></uui-toggle>
                                </uui-table-cell>

                                <uui-table-cell>
                                    <uui-radio-group name="radioOptions">
                                        <uui-radio style="display: inline-block;">Lossy</uui-radio>
                                        <uui-radio style="display: inline-block;">Lossless</uui-radio>
                                    </uui-radio-group>
                                </uui-table-cell>

                                <uui-table-cell>
                                    <uui-slider
                                            style="padding-top: 1.5rem;"
                                            label="Convert quality"
                                            min="1"
                                            max="100"
                                            step="1"
                                            ?hide-step-values="true"
                                            .value="80"
                                            .disabled="false">
                                    </uui-slider>
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
                    
                </uui-box> 
            </div>
        `
    }
    static styles = css`
        .dashboard {
            padding: 1rem;
            height: 100%;
        }
        uui-box {
            margin-bottom: 0.8rem;
        }

        light {
            font-size: 0.8rem;
            font-weight: lighter;
        }

        .muted {
            display: block;
            font-size: 0.8rem;
            font-style: italic;
            font-weight: lighter;
            text-align: center;
        }

        .flex {
            display: flex;
            flex-direction: row;
            justify-content: center;
        }
        uui-table-cell{
            padding: 0.5rem;
        }

        uui-table{
            border:1px #D8D7D9 solid;
            margin-bottom:1rem;
        }

        uui-table-head{
            background-color: #F4F3F5;
            border-radius: 3px;
            overflow: hidden;
        }
    `
}


export default FoldersDashboard

declare global {
    interface HtmlElementTagNameMap {
        'badgernet_umbraco_mediatools-folders_dashboard': FoldersDashboard
    }
}

