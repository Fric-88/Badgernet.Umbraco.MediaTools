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
import {
    UUIInputElement,
    UUIModalContainerElement,
    UUIModalDialogElement,
    UUIToggleElement
} from "@umbraco-cms/backoffice/external/uui";
import MediatoolsContext, {MEDIA_TOOLS_CONTEXT_TOKEN} from "../context/mediatools.context.ts";
import LoadingPopup from "./imageEditor/loadingPopup.ts";
import "./imageEditor/loadingPopup.ts";
import {MediaFolderDto, ResizerFolderOverride} from "../api";

//This Type is only for displaying settings in a list
export type FolderSetting = { 
    key: string, 
    name: string, 
    path: string, 
    width?: number, 
    height?: number, 
    resizeEnabled?: boolean
}; 

@customElement('resizer-folders-dialog')
export class ResizerFolderDialog extends UmbElementMixin(LitElement) {

    #context?: MediatoolsContext;
    @state() dialogTemplate!: TemplateResult;
    
    @state() globalTargetWidth?: number;
    @state() globalTargetHeight?: number;
    @state() globalResizerEnabled?: boolean;
    
    #mediaFolders: MediaFolderDto[] = []; // All Media Folders
    #folderOverrides: ResizerFolderOverride[] = []; // User defined folder settings 
    private unsavedFolderOverrides: ResizerFolderOverride[] = [];
    @state() folderSetting: FolderSetting[] = []; // We build this with joining folders with objects
    
    
    @property({ type: String, attribute: true }) width: string = "800px"; //Default popup width
    @property({ type: String, attribute: true }) height: string = "400px"; //Default popup height

    @query("#modalContainer") container!: UUIModalContainerElement;
    @query("#dialogElement") dialog!: UUIModalDialogElement;
    @query("#loadingPopup") loadingPopup!: LoadingPopup;

    constructor() {
        super();

        this.consumeContext(MEDIA_TOOLS_CONTEXT_TOKEN,(_context) =>{
            this.#context = _context;
            this.observe(_context.mediaFolders, (_value) => {this.#mediaFolders = _value});
            this.observe(_context.resizerFolderOverrides, (_value) => {this.#folderOverrides = _value});
            this.observe(_context.targetWidth, (_value ) => {this.globalTargetWidth = _value;});
            this.observe(_context.targetHeight, (_value ) => {this.globalTargetHeight = _value;});
            this.observe(_context.resizerEnabled, (_value ) => {this.globalResizerEnabled = _value;});
        });
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.#context?.fetchMediaFolders();
    }

    // Opens this popup -> to be called from the parent element
    public async showDialog(){
        if(!this.#context) return;
        
        await this.#context.fetchUserSettings();
        
        //Build FolderSettings list for displaying 
        this.folderSetting = this.#mediaFolders.map( folder => {
            const override = this.#folderOverrides.find(i => folder.key === i.key);

            if(!override) {
                return {
                    ...folder,
                    width: this.globalTargetWidth,
                    height: this.globalTargetHeight,
                    resizeEnabled: this.globalResizerEnabled,
                    
                }
            }
            else{
                return {
                    ...folder,
                    width: override.targetWidth,
                    height: override.targetHeight,
                    resizeEnabled: override.resizerEnabled
                } as FolderSetting
            }
        });

        //Deep copy array to circumvent items being frozen
        this.unsavedFolderOverrides = this.#folderOverrides.map(i => ({
            key: i.key,
            targetWidth: i.targetWidth,
            targetHeight: i.targetHeight,
            resizerEnabled: i.resizerEnabled
        }));
        
        this.#renderList();
    }

    
    // Exit without saving changes
    #closeDialog(){
        const dialog = this.dialog as UUIModalDialogElement;
        dialog.close();
        this.dialogTemplate = html``;
    }
    
    // Save changes and exit
    async #saveAndCloseDialog(){
        
        this.unsavedFolderOverrides.map(item => 
            console.log(item.key, item.targetWidth, item.targetHeight, item.resizerEnabled)
        );
        
        if(this.#context){
            this.#context.resizerFolderOverrides = this.unsavedFolderOverrides;
            await this.#context.saveSettings();
        }
        
        this.#closeDialog();
    } 
    
    #widthChange(e: Event){
        const input = e.target as UUIInputElement;
        const folderKey = input.dataset.folderKey;
        const newValue = Number(input.value);
        
        if(folderKey){
            let item = this.unsavedFolderOverrides.find(i => i.key === folderKey);
            if(item){
                item.targetWidth = newValue;
            }
            else{
                this.unsavedFolderOverrides.push({
                    key: folderKey, 
                    targetWidth: newValue, 
                    targetHeight: this.globalTargetHeight, 
                    resizerEnabled: this.globalResizerEnabled 
                } as ResizerFolderOverride);
            }
        }
    }
    
    #heightChange(e: Event){
        const input = e.target as UUIInputElement;
        const folderKey = input.dataset.folderKey;
        const newValue = Number(input.value);

        if(folderKey){
            let item = this.unsavedFolderOverrides.find(i => i.key === folderKey);
            if(item){
                item.targetHeight = newValue; //Change the height
            }
            else{
                this.unsavedFolderOverrides.push({
                    key: folderKey,
                    targetWidth: this.globalTargetWidth,
                    targetHeight: newValue,
                    resizerEnabled: this.globalResizerEnabled
                } as ResizerFolderOverride);
            }
        }
    }
    
    #resizerToggleChange(e: Event){
        const input = e.target as UUIToggleElement;
        const folderKey = input.dataset.folderKey;
        const newValue = input.checked;

        if(folderKey){
            let item = this.unsavedFolderOverrides.find(i => i.key === folderKey);
            if(item){
                item.resizerEnabled = newValue;
            }
            else{
                this.unsavedFolderOverrides.push({
                    key: folderKey,
                    targetWidth: this.globalTargetWidth,
                    targetHeight: this.globalTargetHeight,
                    resizerEnabled: newValue
                } as ResizerFolderOverride);
            }
        }
    }

    #renderList(){
        this.dialogTemplate = html`
            <uui-modal-dialog id="dialogElement">
                <uui-dialog-layout class="layout" 
                                   headline="Resizer limits for media folders">
                    
                    <p>You can set resizing rules on a "folder by folder" basis here.</p>
       
                    <div class="scrollable" style="display: block; width: ${this.width}; height: ${this.height}">
                        <uui-table aria-label="Filter results" style="padding: 2px; width: 99%;">
    
                            <uui-table-column style="width: auto;"></uui-table-column>
                            <uui-table-column style="auto"></uui-table-column>
                            <uui-table-column style="auto"></uui-table-column>
                            <uui-table-column style="width: 3rem;"></uui-table-column>
                            <uui-table-column style="width: auto;"></uui-table-column>
    
                            ${this.folderSetting.map((setting) => html`
                                <uui-table-row data-folder-key="${setting.key}">
                                    <uui-table-cell >
                                            <div style="display: flex; flex-direction: column">
                                                <div style="display: flex; flex-direction: row; gap: 5px;">
                                                    <uui-icon name="folder" style="font-size: 1rem; margin-top: 2px"></uui-icon>
                                                    <span style="font-weight: bold">${setting.name}<span>
                                                </div>
                                                <small style="font-style: italic">${setting.path}</small>
                                            </div>
                                        </div>
    
                                    </uui-table-cell>
    
                                    <uui-table-cell>
                                            <small>Width</small>
                                            <uui-input type="number"
                                                       min="1"
                                                       max="10000"
                                                       value="${setting.width}"
                                                       data-folder-key="${setting.key}"
                                                       @input="${this.#widthChange}">
                                                <div class="extra" slot="append">px</div>
                                            </uui-input>
                                    </uui-table-cell>
    
                                    <uui-table-cell>
                                        <small>Height</small>
                                        <uui-input type="number"
                                                   min="1"
                                                   max="10000"
                                                   value="${setting.height}"
                                                   data-folder-key="${setting.key}"
                                                   @input="${this.#heightChange}">
                                            <div class="extra" slot="append">px</div>
                                        </uui-input>
                                            
                                    </uui-table-cell>
    
                                    <uui-table-cell>
                                        <small>Resize</small>
                                        <uui-toggle .checked = "${setting.resizeEnabled}"
                                                    data-folder-key="${setting.key}"
                                                    @change="${this.#resizerToggleChange}"></uui-toggle>
                                    </uui-table-cell>
    
                                </uui-table-row>
                            `)}
    
                        </uui-table>
                    </div>
                    
                    <div class="buttonsBar">
                        <uui-button slot="actions" label="Metadata"
                                    look="primary" color="default"
                                    @click="${this.#saveAndCloseDialog}">Save & Close
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

        .extra {
            user-select: none;
            height: 100%;
            padding: 0 var(--uui-size-3);
            background: #f3f3f3;
            color: grey;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .extra:first-child {
            var(--uui-input-border-color, var(--uui-color-border));
        }
        * + .extra {
            border-left: 1px solid
            var(--uui-input-border-color, var(--uui-color-border));
        }

    `
}

export default ResizerFolderDialog;

declare global {
    interface HtmlElementTagNameMap {
        'resizer-folders-dialog': ResizerFolderDialog
    }
}


