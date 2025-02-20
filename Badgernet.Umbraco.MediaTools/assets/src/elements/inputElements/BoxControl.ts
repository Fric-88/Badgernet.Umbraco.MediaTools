import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { LitElement, property } from "@umbraco-cms/backoffice/external/lit";

export class BoxControl extends UmbElementMixin(LitElement){
    @property({attribute: true}) controlIdentifier: string = "";
} 