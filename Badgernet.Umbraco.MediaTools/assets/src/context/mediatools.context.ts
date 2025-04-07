import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { MediaToolsRepository } from "../repository/mediatools.repository";
import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import {
    UmbArrayState, UmbBooleanState, UmbClassState,
    UmbNumberState, UmbObjectState, UmbStringState
} from "@umbraco-cms/backoffice/observable-api";
import {
    ConvertMode, DownloadMediaData, FilterGalleryData,
    GetSettingsData, ProcessImagesData, SetSettingsData,
    UserSettingsDto, RecycleMediaData, RenameMediaData,
    ReplaceImageData, GetMediaInfoData, GetMetadataData, MediaFolderDto, ResizerFolderOverride
} from "../api";
import { clampNumber } from "../code/helperFunctions";
import { Observable } from "@umbraco-cms/backoffice/observable-api";
import { UMB_CURRENT_USER_CONTEXT, UmbCurrentUserModel } from "@umbraco-cms/backoffice/current-user";

export class MediaToolsContext extends UmbControllerBase {

    #repository: MediaToolsRepository;
    #currentUser?: UmbCurrentUserModel;

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
    #mediaFolders = new UmbArrayState<MediaFolderDto>([], (x) => x.key);
    #mediaFolderOptions = new UmbArrayState<Option>([], (x) => x.value);
    #resizerFolderOverrides = new UmbArrayState<ResizerFolderOverride>([], (x) => x.key);
    #removeDateTime = new UmbBooleanState(true);
    #removeCameraInfo = new UmbBooleanState(true);
    #removeGpsInfo = new UmbBooleanState(true);
    #removeAuthorInfo = new UmbBooleanState(false);
    #removeXmpProfile = new UmbBooleanState(false);
    #removeIptcProfile = new UmbBooleanState(false);
    #metaTagsToRemove = new UmbArrayState<string>([], (item) => item);
    
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
    public get resizerFolderOverrides() : Observable<ResizerFolderOverride[]> {
        return this.#resizerFolderOverrides.asObservable();
    }
    public set resizerFolderOverrides(value : ResizerFolderOverride[]) {
        this.#resizerFolderOverrides.setValue(value);
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
    public get mediaFolders() : Observable<MediaFolderDto[]>{
        return this.#mediaFolders.asObservable();  
    }
    public set mediaFolders(value: MediaFolderDto[]) {
        this.#mediaFolders.setValue(value)
    }
    public get mediaFoldersOptions() : Observable<Option[]>{
        return this.#mediaFolderOptions.asObservable();
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
    public get removeShootingSituationInfo() :Observable<boolean>{
        return this.#removeAuthorInfo.asObservable();
    } 
    public set removeShootingSituationInfo(value: boolean) {
        this.#removeAuthorInfo.setValue(value);
    }
    public get removeXmpProfile(): Observable<boolean> {
        return this.#removeXmpProfile.asObservable();
    }
    public set removeXmpProfile(value: boolean) {
        this.#removeXmpProfile.setValue(value);
    }
    public get removeIptcProfile(): Observable<boolean> {
        return this.#removeIptcProfile.asObservable();
    }
    public set removeIptcProfile(value: boolean) {
        this.#removeIptcProfile.setValue(value);
    }
    public get metaTagsToRemove(): Observable<string[]> {
        return this.#metaTagsToRemove.asObservable();
    }
    public addMetaTagsToRemove(value: string) {
        if(!this.#metaTagsToRemove.getValue().includes(value)) {
            this.#metaTagsToRemove.appendOne(value);
        }
    } 
    public removeMetaTagsToRemove(value: string) {
        if(this.#metaTagsToRemove.getValue().includes(value)) {
           this.#metaTagsToRemove.remove([value]); 
        }
    }

    constructor(host: UmbControllerHost) {
        super(host);
        this.provideContext(MEDIA_TOOLS_CONTEXT_TOKEN, this);
        this.#repository = new MediaToolsRepository(this);

        this.consumeContext(UMB_CURRENT_USER_CONTEXT, (instance) => {
            this._observeCurrentUser(instance);
        });
    }

    private async _observeCurrentUser(instance: typeof UMB_CURRENT_USER_CONTEXT.TYPE) {
        this.observe(instance.currentUser, (currentUser) => {
            this.#currentUser = currentUser;
        });
    }


    async fetchGalleryInfo() {
        const responseData = await this.#repository.getGalleryInfo();
        if(responseData)
            return responseData.data;
    }
    
    
    
    async fetchUserSettings(){

        if(!this.#currentUser) return null;

        const reqData: GetSettingsData = {
            userKey: this.#currentUser.unique
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
            this.#resizerFolderOverrides.setValue(responseData.resizer.folderOverrides);
            this.#keepOriginals.setValue(responseData.general.keepOriginals);
            this.#ignoreKeyword.setValue(responseData.general.ignoreKeyword);
            this.#metaRemoverEnabled.setValue(responseData.metadataRemover.enabled);
            this.#removeDateTime.setValue(responseData.metadataRemover.removeDateTime);
            this.#removeCameraInfo.setValue(responseData.metadataRemover.removeCameraInfo);
            this.#removeGpsInfo.setValue(responseData.metadataRemover.removeGpsInfo);
            this.#removeAuthorInfo.setValue(responseData.metadataRemover.removeShootingSituationInfo);
            this.#removeXmpProfile.setValue(responseData.metadataRemover.removeXmpProfile);
            this.#removeIptcProfile.setValue(responseData.metadataRemover.removeIptcProfile);
            this.#metaTagsToRemove.setValue(responseData.metadataRemover.metadataTagsToRemove);
        }
    }

    async saveSettings(){

        if(!this.#currentUser) return null;

        //Map observables to settings object
        const settings: UserSettingsDto = {
            resizer: {
                enabled: this.#resizerEnabled.getValue(),
                targetWidth: this.#targetWidth.getValue(),
                targetHeight: this.#targetHeight.getValue(),
                ignoreAspectRatio: this.#ignoreAspectRatio.getValue(),
                folderOverrides: this.#resizerFolderOverrides.getValue()
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
                removeShootingSituationInfo: this.#removeAuthorInfo.getValue(),
                metadataTagsToRemove: this.#metaTagsToRemove.getValue(),
                removeXmpProfile: this.#removeXmpProfile.getValue(),
                removeIptcProfile: this.#removeIptcProfile.getValue()
            },
            general: {
                ignoreKeyword: this.#ignoreKeyword.getValue(),
                keepOriginals: this.#keepOriginals.getValue()
                
            }
        }

        //Build request data
        const reqData: SetSettingsData = {
            userKey: this.#currentUser.unique,
            requestBody: settings
        }

        //Send setting to server
        await this.#repository.saveSettings(reqData);
    }

    async fetchMediaFolders(){
        const response = (await this.#repository.listFolders());
        if(response){
            const responseData = response.data as Array<MediaFolderDto>;
            if(responseData){
                this.#mediaFolders.setValue(responseData);
            }
            
            let folderOptions: Array<Option> = [];
            folderOptions.push({name: "All folders", value: "", selected: true} );
            for(const item of responseData){
                folderOptions.push({name: item.name, value: item.name, selected: false });
            }
            
            this.#mediaFolderOptions.setValue(folderOptions);
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