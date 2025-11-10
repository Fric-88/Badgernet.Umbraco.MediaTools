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
    ReplaceImageData, GetMediaInfoData, GetMetadataData, UserSettingsDto, FilterImagesDto, ProcessImagesDto
} from "../api";

export class MediaToolsRepository extends UmbControllerBase {
    #datasource : MediaToolsManagementDataSource;

    constructor(host: UmbControllerHost) {
        super(host);
        this.#datasource  = new MediaToolsManagementDataSource(this);
    }
    async fetchSettings(userKey?: string) {
        if(!userKey) return; 
        
        const requestData: GetSettingsData = {
            query: {
                userKey: userKey
            },
            url: "/settings/get-settings"
            
        }  
        return this.#datasource.fetchSettings(requestData);
    }
    async saveSettings(userKey?: string, userSettings?: UserSettingsDto){
        
        const requestData: SetSettingsData = {
            body: userSettings,
            query: {
                userKey: userKey
            },
            url: "/settings/set-settings"
        }

        return this.#datasource.saveSettings(requestData);
    }
    async listFolders(){
        return this.#datasource.listFolders();
    }
    async searchMedia(imageFilter: FilterImagesDto){
        
        const requestData: SearchMediaData = {
            body: imageFilter,
            url: "/gallery/search-media"
        } 
        
        return this.#datasource.searchMedia(requestData);
    }
    async processImage(imageProcessData: ProcessImagesDto){
        
        const requestData: ProcessImagesData = {
            body: imageProcessData,
            url: "/gallery/process-images"
        } 
        return this.#datasource.processImage(requestData);
    }
    async trashMedia(imageIds: Array<number>){
        
        const requestData: TrashMediaData = {
            body: imageIds,
            url: "/gallery/trash-media"
        } 
        return this.#datasource.trashMedia(requestData);
    }
    async downloadMedia(imageIds: Array<number>){
        
        const requestData: DownloadMediaData = {
            body: imageIds,
            url: "/gallery/download-media"
        } 
        return this.#datasource.downloadMedia(requestData);
    }
    async renameMedia(mediaId: number, newName: string){
        
        const requestData: RenameMediaData = {
            query: {
                mediaId: mediaId,
                newName: newName
            },
            url: "/gallery/rename-media"
        }
        return this.#datasource.renameMedia(requestData);
    } 
    async replaceImage(imageId: number, saveAs: string, imageData: Blob | File){
        
        const requestData: ReplaceImageData = {
            body: {
                imageFile: imageData
            },
            query: {
                id: imageId,
                saveAs: saveAs
            },
            url: "/gallery/replace-image"
        }
        return this.#datasource.replaceImage(requestData);
    }
    async getMediaInfo(mediaId: number){
        
        const requestData: GetMediaInfoData = {
            query: {
                mediaId: mediaId
            },
            url: "/gallery/get-media-info"
        } 
        return this.#datasource.getMediaInfo(requestData);
    }
    async getMediaMetadata(mediaId: number){
        
        const requestData: GetMetadataData = {
            query: {
                id: mediaId
            },
            url: "/gallery/get-metadata"
        }
        return this.#datasource.getMediaMetadata(requestData);
    }
}