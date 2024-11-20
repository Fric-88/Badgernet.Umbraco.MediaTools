import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { MediaToolsManagementDataSource } from "./mediatools.datasource";
import { ProcessImagesData, RecycleMediaData, DownloadMediaData, FilterGalleryData, GetSettingsData, SetSettingsData } from "../api";

export class MediaToolsRepository extends UmbControllerBase {
    #datasource : MediaToolsManagementDataSource;

    constructor(host: UmbControllerHost) {
        super(host);
        this.#datasource  = new MediaToolsManagementDataSource(this);
    }

    async getGalleryInfo(){
        return this.#datasource.getGalleryInfo(); 
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

    async filterGallery(requestData: FilterGalleryData){
        return this.#datasource.filterGallery(requestData);
    }

    async processImage(requestData: ProcessImagesData){
        return this.#datasource.processImage(requestData);
    }

    async recycleMedia(requestData: RecycleMediaData){
        return this.#datasource.recycleMedia(requestData);
    }

    async downloadMedia(requestData: DownloadMediaData){
        return this.#datasource.downloadMedia(requestData);
    }



}