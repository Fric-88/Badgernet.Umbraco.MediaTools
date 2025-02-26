import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { MediaToolsRepository } from "../repository/mediatools.repository";
import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import { UmbArrayState, UmbBooleanState,
         UmbNumberState, UmbStringState } from "@umbraco-cms/backoffice/observable-api";
import {
    ConvertMode, DownloadMediaData, FilterGalleryData,
    GetSettingsData, ProcessImagesData, SetSettingsData,
    UserSettingsDto, RecycleMediaData, RenameMediaData,
    ReplaceImageData, GetMediaInfoData, GetMetadataData
} from "../api";
import { clampNumber } from "../code/helperFunctions";
import { Observable } from "@umbraco-cms/backoffice/observable-api";

export type MediaFolder = {name: string, value: string};
export class MediaToolsContext extends UmbControllerBase {

    #repository: MediaToolsRepository;

    #resizerEnabled = new UmbBooleanState(false);
    #converterEnabled = new UmbBooleanState(true);
    #metaRemoverEnabled = new UmbBooleanState(false);
    #convertQuality = new UmbNumberState(80);
    #convertMode = new UmbStringState("Lossy" as ConvertMode);
    #ignoreAspectRatio = new UmbBooleanState(false);
    #targetWidth = new UmbNumberState(1920);
    #targetHeight = new UmbNumberState(1080);
    #keepOriginals = new UmbBooleanState(false);
    #ignoreKeyword = new UmbStringState("ignoreme");
    #mediaFolders = new UmbArrayState([{name: "All folders", value: ""} as MediaFolder],(element) => element);
    #removeDateTime = new UmbBooleanState(true);
    #removeCameraInfo = new UmbBooleanState(true);
    #removeGpsInfo = new UmbBooleanState(true);
    #removeAuthorInfo = new UmbBooleanState(false);
    
    public get resizerEnabled() : Observable<boolean>{
        return this.#resizerEnabled.asObservable();  
    } 
    public set resizerEnabled(value : boolean){
        this.#resizerEnabled.setValue(value);
    }
    public get converterEnabled() : Observable<boolean>{
        return this.#converterEnabled.asObservable();  
    } 
    public set converterEnabled(value: boolean){
        this.#converterEnabled.setValue(value);
    }
    public get metaRemoverEnabled() : Observable<boolean>{
        return this.#metaRemoverEnabled.asObservable();
    }
    public set metaRemoverEnabled(value : boolean){
        this.#metaRemoverEnabled.setValue(value);
    }
    public get convertQuality() : Observable<number> {
        return this.#convertQuality.asObservable();
    }
    public set convertQuality(value: number) {
        value = clampNumber(value, 1, 100);
        this.#convertQuality.setValue(value);
    }
    public get convertMode() : Observable<string> {
        return this.#convertMode.asObservable();  
    } 
    public set convertMode(value: ConvertMode) {
        this.#convertMode.setValue(value);
    }
    public get ignoreAspectRatio() : Observable<boolean> {
        return this.#ignoreAspectRatio.asObservable();  
    } 
    public set ignoreAspectRatio(value: boolean) {
        this.#ignoreAspectRatio.setValue(value);
    }
    public get targetWidth() : Observable<number> {
        return this.#targetWidth.asObservable();  
    } 
    public set targetWidth(value : number){
        value = clampNumber(value, 1, 10000);
        this.#targetWidth.setValue(value);
    }
    public get targetHeight() :Observable<number>{
        return this.#targetHeight.asObservable();  
    } 
    public set targetHeight(value : number){
        value = clampNumber(value, 1, 10000);
        this.#targetHeight.setValue(value);
    }
    public get keepOriginals() :Observable<boolean> {
        return this.#keepOriginals.asObservable();
    }
    public set keepOriginals(value: boolean) {
        this.#keepOriginals.setValue(value);
    }
    public get ignoreKeyword():Observable<string> {
        return this.#ignoreKeyword.asObservable();  
    } 
    public set ignoreKeyword(value: string) {
        this.#ignoreKeyword.setValue(value);
    }
    public get mediaFolders() : Observable<MediaFolder[]>{
        return this.#mediaFolders.asObservable();  
    }
    public set mediaFolders(value: {name: string, value: string}[]) {
        this.#mediaFolders.setValue(value)
    }
    public get removeDateTime() : Observable<boolean> {
        return this.#removeDateTime.asObservable();  
    } 
    public set removeDateTime(value: boolean) {
        this.#removeDateTime.setValue(value);
    }
    public get removeCameraInfo() : Observable<boolean>  {
        return this.#removeCameraInfo.asObservable();
    }
    public set removeCameraInfo(value: boolean) {
        this.#removeCameraInfo.setValue(value);
    }
    public get removeGpsInfo(): Observable<boolean> { 
        return this.#removeGpsInfo.asObservable();
    }
    public set removeGpsInfo(value: boolean) {
        this.#removeGpsInfo.setValue(value);
    }
    public get removeAuthorInfo() :Observable<boolean>{
        return this.#removeAuthorInfo.asObservable();
    } 
    public set removeAuthorInfo(value: boolean) {
        this.#removeAuthorInfo.setValue(value);
    }

    constructor(host: UmbControllerHost) {
        super(host);
        this.provideContext(MEDIA_TOOLS_CONTEXT_TOKEN, this);
        this.#repository = new MediaToolsRepository(this);
    }

    async getGalleryInfo() {
        const responseData = await this.#repository.getGalleryInfo();

        if(responseData)
            return responseData.data;
    }
    
    async loadSettings(userKey: string){

        const reqData: GetSettingsData = {
            userKey: userKey
        }

        const responseData = (await this.#repository.fetchSettings(reqData)).data as UserSettingsDto;

        if(responseData) {
            this.#resizerEnabled.setValue(responseData.resizer.enabled);
            this.#converterEnabled.setValue(responseData.converter.enabled);
            
            this.#convertMode.setValue(responseData.converter.convertMode);
            this.#convertQuality.setValue(responseData.converter.convertQuality);
            this.#ignoreAspectRatio.setValue(responseData.resizer.ignoreAspectRatio);
            this.#targetWidth.setValue(responseData.resizer.targetWidth);
            this.#targetHeight.setValue(responseData.resizer.targetHeight);
            this.#keepOriginals.setValue(responseData.general.keepOriginals);
            this.#ignoreKeyword.setValue(responseData.general.ignoreKeyword);
            this.#metaRemoverEnabled.setValue(responseData.metadataRemover.enabled);
            this.#removeDateTime.setValue(responseData.metadataRemover.removeDateTime);
            this.#removeCameraInfo.setValue(responseData.metadataRemover.removeCameraInfo);
            this.#removeGpsInfo.setValue(responseData.metadataRemover.removeGpsInfo);
            this.#removeAuthorInfo.setValue(responseData.metadataRemover.removeAuthorCopyright);
        }
    }

    async saveSettings(userKey: string){

        //Map observables to settings object
        const settings: UserSettingsDto = {
            resizer: {
                enabled: this.#resizerEnabled.getValue(),
                targetWidth: this.#targetWidth.getValue(),
                targetHeight: this.#targetHeight.getValue(),
                ignoreAspectRatio: this.#ignoreAspectRatio.getValue()
            },
            converter: {
                enabled: this.#converterEnabled.getValue(),
                convertMode: this.#convertMode.getValue() as ConvertMode,
                convertQuality: this.#convertQuality.getValue()
            },
            metadataRemover: {
                enabled: this.#metaRemoverEnabled.getValue(),
                removeDateTime: this.#removeDateTime.getValue(),
                removeGpsInfo: this.#removeGpsInfo.getValue(),
                removeCameraInfo: this.#removeCameraInfo.getValue(),
                removeAuthorCopyright: this.#removeAuthorInfo.getValue()
            },
            general: {
                ignoreKeyword: this.#ignoreKeyword.getValue(),
                keepOriginals: this.#keepOriginals.getValue()
            }
        }

        //Build request data
        const reqData: SetSettingsData = {
            userKey: userKey,
            requestBody: settings
        }

        //Send setting to server
        await this.#repository.saveSettings(reqData);
    }

    async listFolders(){

        const responseData = (await this.#repository.listFolders());

        if(responseData){
            const foldersArray = responseData.data as Array<string>;
            const options = new Array<Option>();

            options.push({value: "All", name: "All folders", selected: true});
            
            for(let folder of foldersArray){
                options.push({value: folder, name: folder});
            }
            this.#mediaFolders.setValue(options);    
        }
    }

    async filterGallery(requestData: FilterGalleryData){
        const responseData = (await this.#repository.filterGallery(requestData));

        if(responseData){
            return responseData;
        }

    }

    async processImage(requestData: ProcessImagesData){
        const responseData = (await this.#repository.processImage(requestData));

        if(responseData){
            return responseData;
        }
    }

    async trashMedia(requestData: RecycleMediaData ){
        const responseData = await this.#repository.recycleMedia(requestData);

        if(responseData){
            return responseData;
        }
    }

    async downloadMedia(requestData: DownloadMediaData){
        const responseData = await this.#repository.downloadMedia(requestData);

        if(responseData){
            return responseData;
        }
    }
    
    async renameMedia(requestData: RenameMediaData ){
        return await this.#repository.renameMedia(requestData);
    }
    
    async replaceImage(requestData: ReplaceImageData ){
        return await this.#repository.replaceImage(requestData);
    }
    async getMediaInfo(requestData: GetMediaInfoData){
        return await this.#repository.getMediaInfo(requestData); 
    }
    
    async getMediaMetadata(requestData: GetMetadataData){
        return await this.#repository.getMediaMetadata(requestData);
    }
}

export default MediaToolsContext; 
export const MEDIA_TOOLS_CONTEXT_TOKEN = new UmbContextToken<MediaToolsContext>("MediaToolsContext")