import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UmbDataSourceResponse  } from "@umbraco-cms/backoffice/repository";
import { tryExecuteAndNotify } from '@umbraco-cms/backoffice/resources';
import {
    getSettings,
    setSettings,
    searchMedia,
    downloadMedia,
    getMediaFolders,
    renameMedia,
    ReplaceImageData,
    ReplaceImageResponse,
    replaceImage,
    GetMediaInfoResponse,
    getMediaInfo,
    GetMediaInfoData,
    GetMetadataData, GetMetadataResponse, getMetadata
} from "../api";

import {
    DownloadMediaData,
    DownloadMediaResponse,
    SearchMediaData,
    GetSettingsData,
    ImageMediaDto,
    GetMediaFoldersResponse,
    ProcessImagesData,
    ProcessImagesResponse,
    SetSettingsData,
    UserSettingsDto,
    TrashMediaData,
    TrashMediaResponse,
    processImages,
    trashMedia,
    RenameMediaData,
    RenameMediaResponse
} from "../api";

export class MediaToolsManagementDataSource {

    #host: UmbControllerHost;

    constructor(host: UmbControllerHost) {
        this.#host = host;
    }
    async fetchSettings(requestData: GetSettingsData): Promise<UmbDataSourceResponse<UserSettingsDto>> {
        return await tryExecuteAndNotify(this.#host, getSettings(requestData));
    }
    async saveSettings(requestData: SetSettingsData): Promise<UmbDataSourceResponse<unknown>> {
        return await tryExecuteAndNotify(this.#host, setSettings(requestData));
    }
    async listFolders(): Promise<UmbDataSourceResponse<GetMediaFoldersResponse>>{
        return await tryExecuteAndNotify(this.#host, getMediaFolders());
    }
    async searchMedia(requestData: SearchMediaData ): Promise<UmbDataSourceResponse<ImageMediaDto[]>> {
        return await tryExecuteAndNotify(this.#host, searchMedia(requestData));
    }
    async processImage(requestData: ProcessImagesData): Promise<UmbDataSourceResponse<ProcessImagesResponse>>{
        return await tryExecuteAndNotify(this.#host, processImages(requestData));
    }
    async trashMedia(requestData: TrashMediaData ): Promise<UmbDataSourceResponse<TrashMediaResponse>>{
        return await tryExecuteAndNotify(this.#host, trashMedia(requestData));
    }
    async downloadMedia(requestData: DownloadMediaData): Promise<UmbDataSourceResponse<DownloadMediaResponse>>{
        return await tryExecuteAndNotify(this.#host, downloadMedia(requestData));
    }
    async renameMedia(requestData: RenameMediaData): Promise<UmbDataSourceResponse<RenameMediaResponse>> {
        return await tryExecuteAndNotify(this.#host, renameMedia(requestData));
    }
    async replaceImage(requestData: ReplaceImageData): Promise<UmbDataSourceResponse<ReplaceImageResponse>>{
        return await tryExecuteAndNotify(this.#host, replaceImage(requestData));
    }
    async getMediaInfo(requestData: GetMediaInfoData):Promise<UmbDataSourceResponse<GetMediaInfoResponse>>{
        return await tryExecuteAndNotify(this.#host, getMediaInfo(requestData));
    }
    async getMediaMetadata(requestData: GetMetadataData ): Promise<UmbDataSourceResponse<GetMetadataResponse>>{
        return await tryExecuteAndNotify(this.#host, getMetadata(requestData));
    }

    
}