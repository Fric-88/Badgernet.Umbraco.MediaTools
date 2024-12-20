import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, state, property } from "@umbraco-cms/backoffice/external/lit";
import "./icons/imageEditorIconRegistry.ts"

export type ToolSelection = "draw" | "rotate" | "move" | "spray" | "crop" | "adjust";
@customElement('canvas-tools-panel')
export class CanvasToolsPanel extends UmbElementMixin(LitElement) {
    
    @state() selectedTool: ToolSelection = "move"; //We select move initially
    constructor() {
        super();
    }
    
    #changeTool(tool: ToolSelection) {
        this.selectedTool = tool;
        this.#dispatchEvent(tool + "-selected");
    }
    
    #dispatchEvent(eventName: string){
        const event = new Event(eventName,{
            bubbles: true,       // Allows the event to bubble up through the DOM
            composed: true       // Allows the event to pass through shadow DOM boundaries
        });
        this.dispatchEvent(event);
    }
    

    render() {
        return html`
            <mediatools-icon-registry>
                <div class="centeredColumn">
                    
                    <div class="centeredRow">
                        <div class="selectionBar ${ this.selectedTool === "move" ? "selected" : ""}"></div>
                        <uui-button look="secondary" color="default" @click = "${ () => this.#changeTool("move")}">
                            <div class="centeredColumn">
                                <uui-icon name="move"></uui-icon>
                                <small>Move</small>
                            </div>
                        </uui-button>
                    </div>
    
                    <div class="centeredRow">
                        <div class="selectionBar ${ this.selectedTool === "draw" ? "selected" : ""}"></div>
                        <uui-button look="secondary" color="default" @click = "${ () => this.#changeTool("draw")}">
                            <div class="centeredColumn">
                                <uui-icon name="pen"></uui-icon>
                                <small>Draw</small>
                            </div>
                        </uui-button>
                    </div>

                    <div class="centeredRow">
                        <div class="selectionBar ${ this.selectedTool === "spray" ? "selected" : ""}"></div>
                        <uui-button look="secondary" color="default" @click = "${ () => this.#changeTool("spray")}">
                            <div class="centeredColumn">
                                <uui-icon name="spray"></uui-icon>
                                <small>Spray</small>
                            </div>
                        </uui-button>
                    </div>

                    <div class="centeredRow">
                        <div class="selectionBar ${ this.selectedTool === "rotate" ? "selected" : ""}"></div>
                        <uui-button look="secondary" color="default" @click = "${ () => this.#changeTool("rotate")}">
                            <div class="centeredColumn">
                                <uui-icon name="rotate"></uui-icon>
                                <small>Rotate</small>
                            </div>
                        </uui-button>
                    </div>

                    <div class="centeredRow">
                        <div class="selectionBar ${ this.selectedTool === "crop" ? "selected" : ""}"></div>
                        <uui-button look="secondary" color="default" @click = "${ () => this.#changeTool("crop")}">
                            <div class="centeredColumn">
                                <uui-icon name="crop"></uui-icon>
                                <small>Crop</small>
                            </div>
                        </uui-button>
                    </div>

                    <div class="centeredRow">
                        <div class="selectionBar ${ this.selectedTool === "adjust" ? "selected" : ""}"></div>
                        <uui-button look="secondary" color="default" @click = "${ () => this.#changeTool("adjust")}">
                            <div class="centeredColumn">
                                <uui-icon name="adjust"></uui-icon>
                                <small>Adjust</small>
                            </div>
                        </uui-button>
                    </div>

                    <div class="centeredRow">
                        <div class="selectionBar"></div>
                        <uui-button look="secondary" color="positive" @click = "${() => this.#dispatchEvent("save-click")}">
                            <div class="centeredColumn">
                                <uui-icon name="save"></uui-icon>
                                <small>Save</small>
                            </div>
                        </uui-button>
                    </div>

                    <div class="centeredRow">
                        <div class="selectionBar"></div>
                        <uui-button look="secondary" color="danger" @click = "${() => this.#dispatchEvent("exit-click")}">
                            <div class="centeredColumn">
                                <uui-icon name="exit"></uui-icon>
                                <small>Exit</small>
                            </div>
                        </uui-button>
                    </div>
                    
                </div>
            </mediatools-icon-registry>
        `
    }

    static styles = css`
        
        uui-button{
            width: 4rem;
        }
        .centeredColumn{
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px
        }
        
        .centeredRow{
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 3px;
        }
        
        .selectionBar{
            display: block;
            width: 5px;
            align-self: stretch;
            border-radius: 3px;
            background-color: transparent;
            transition: background-color 0.1s ease;
        }
        
        .selected{
            background-color: #3544b1;
            
        }
    `
}

export default CanvasToolsPanel;

declare global {
    interface HtmlElementTagNameMap {
        'canvas-tools-panel': CanvasToolsPanel
    }
}

