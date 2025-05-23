import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { MediaToolsManagementDataSource } from "./mediatools.datasource";
import {
    ProcessImagesData,
    TrashMediaData,
    DownloadMediaData,
    SearchMediaData,
    GetSettingsData,
    SetSettingsData,
    RenameMediaData,
    ReplaceImageData, GetMediaInfoData, GetMetadataData
} from "../api";

export class MediaToolsRepository extends UmbControllerBase {
    #datasource : MediaToolsManagementDataSource;

    constructor(host: UmbControllerHost) {
        super(host);
        this.#datasource  = new MediaToolsManagementDataSource(this);
    }
    async fetchSettings(requestData: GetSettingsData) {
        return this.#datasource.fetchSettings(requestData);
    }
    async saveSettings(requestData: SetSettingsData ){
        return this.#datasource.saveSettings(requestData);
    }
    async listFolders(){
        return this.#datasource.listFolders();
    }
    async searchMedia(requestData: SearchMediaData){
        return this.#datasource.searchMedia(requestData);
    }
    async processImage(requestData: ProcessImagesData){
        return this.#datasource.processImage(requestData);
    }
    async trashMedia(requestData: TrashMediaData){
        return this.#datasource.trashMedia(requestData);
    }
    async downloadMedia(requestData: DownloadMediaData){
        return this.#datasource.downloadMedia(requestData);
    }
    async renameMedia(requestData: RenameMediaData){
        return this.#datasource.renameMedia(requestData);
    } 
    async replaceImage(requestData: ReplaceImageData){
        return this.#datasource.replaceImage(requestData);
    }
    async getMediaInfo(requestData: GetMediaInfoData){
        return this.#datasource.getMediaInfo(requestData);
    }
    async getMediaMetadata(requestData: GetMetadataData){
        return this.#datasource.getMediaMetadata(requestData);
    }
}