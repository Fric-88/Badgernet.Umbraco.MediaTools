import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, html, css, customElement, query, TemplateResult, state} from "@umbraco-cms/backoffice/external/lit";
import { UUIModalContainerElement, UUIModalDialogElement } from "@umbraco-cms/backoffice/external/uui";


@customElement('loading-popup')
export class LoadingPopup extends UmbElementMixin(LitElement) {

    constructor() {
        super();
    }
    @state() dialogTemplate!: TemplateResult;
    @query("#previewContainer") container!: UUIModalContainerElement;
    @query("#innerDialog") dialog!: UUIModalDialogElement;

    public closePopup(): void {
        const dialog = this.dialog as UUIModalDialogElement;
        dialog.close();
        this.dialogTemplate = html``;
    }

    public openPopup(message: string): void{

        this.dialogTemplate = html`
        <uui-modal-dialog id="innerDialog">
            <uui-dialog-layout>

                <div class="centeredRow">
                    <uui-loader-circle style="color: #006eff; font-size: 6em"></uui-loader-circle>
                    <p>${message}</p>
                </div>


            </uui-dialog-layout>

        </uui-modal-dialog>
        `
    }

    render() {
        return html`
            <uui-modal-container id="previewContainer" >
                ${this.dialogTemplate}
            </uui-modal-container>
        `
    }

    static styles = css`
        .centeredRow {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            align-items: center;
            justify-items: center;
            margin: 3rem;
        }


    `
}

export default LoadingPopup;

declare global {
    interface HtmlElementTagNameMap {
        'loading-popup': LoadingPopup
    }
}

