import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { MediaToolsRepository } from "../repository/mediatools.repository";
import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import { UmbArrayState, UmbBooleanState, UmbNumberState, UmbStringState } from "@umbraco-cms/backoffice/observable-api";
import {
    ConvertMode,
    DownloadMediaData,
    FilterGalleryData,
    GetSettingsData,
    ProcessImagesData,
    SetSettingsData,
    UserSettingsDto,
    RecycleMediaData,
    GalleryInfoDto,
    RenameMediaData, ReplaceImageData, GetMediaInfoData
} from "../api";
import { isNumber, isBool, isString, clampNumber } from "../code/helperFunctions";



export type MediaToolProperties =  keyof UserSettingsDto;
export class MediaToolsContext extends UmbControllerBase {

    #repository: MediaToolsRepository;

    #resizerEnabled = new UmbBooleanState(false);
    public readonly resizerEnabled = this.#resizerEnabled.asObservable();

    #converterEnabled = new UmbBooleanState(true);
    public readonly converterEnabled = this.#converterEnabled.asObservable();

    #convertQuality = new UmbNumberState(80);
    public readonly convertQuality = this.#convertQuality.asObservable();

    #convertMode = new UmbStringState("lossy");
    public readonly convertMode = this.#convertMode.asObservable();

    #ignoreAspectRatio = new UmbBooleanState(false);
    public readonly ignoreAspectRatio = this.#ignoreAspectRatio.asObservable();

    #targetWidth = new UmbNumberState(1920);
    public readonly targetWidth = this.#targetWidth.asObservable();

    #targetHeight = new UmbNumberState(1080);
    public readonly targetHeight = this.#targetHeight.asObservable();

    #keepOriginals = new UmbBooleanState(false);
    public readonly keepOriginals = this.#keepOriginals.asObservable();

    #ignoreKeyword = new UmbStringState("ignoreme");
    public readonly ignoreKeyword = this.#ignoreKeyword.asObservable();

    #mediaFolders = new UmbArrayState([{name: "All folders", value: ""}],(element) => element);
    public readonly mediaFolders = this.#mediaFolders.asObservable();


    constructor(host: UmbControllerHost) {
        super(host);
        this.provideContext(MEDIA_TOOLS_CONTEXT_TOKEN, this);
        this.#repository = new MediaToolsRepository(this);
    }

    //Generic property setter 
    public setProperty(targetProperty: MediaToolProperties  , value: any){

        if(value != undefined){
            switch(targetProperty){
                case "resizerEnabled":
                    if(!isBool(value)) return;
                    this.#resizerEnabled.setValue(value);
                    break;
                case "converterEnabled":
                    if(!isBool(value)) return; 
                    this.#converterEnabled.setValue(value);
                    break;
                case "convertMode":
                    if(!isString(value)) return;
                    this.#convertMode.setValue(value);
                    break; 
                case "convertQuality":
                    if(!isNumber(value)) return;
                    value = clampNumber(value, 1, 100);
                    this.#convertQuality.setValue(value);
                    break;
                case "ignoreAspectRatio":
                    if(!isBool(value)) return; 
                    this.#ignoreAspectRatio.setValue(value);
                    break;
                case "targetWidth":
                    if(!isNumber(value)) return; 
                    value = clampNumber(value, 1, 10000);
                    this.#targetWidth.setValue(value);
                    break;
                case "targetHeight":
                    if(!isNumber(value)) return;
                    value = clampNumber(value, 1, 10000);
                    this.#targetHeight.setValue(value)
                    break;
                case "keepOriginals":
                    if(!isBool(value)) return;
                    this.#keepOriginals.setValue(value); 
                    break; 
                case "ignoreKeyword":
                    if(!isString(value)) return;
                    this.#ignoreKeyword.setValue(value);
                    break;
                default:
                    console.log('Could not change property: ${targetProperty}');
                    break;
            }
        }
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

        if(responseData){
            this.#resizerEnabled.setValue(responseData.resizerEnabled);
            this.#converterEnabled.setValue(responseData.converterEnabled);
            this.#convertMode.setValue(responseData.convertMode);
            this.#convertQuality.setValue(responseData.convertQuality);
            this.#ignoreAspectRatio.setValue(responseData.ignoreAspectRatio);
            this.#targetWidth.setValue(responseData.targetWidth);
            this.#targetHeight.setValue(responseData.targetHeight);
            this.#keepOriginals.setValue(responseData.keepOriginals);
            this.#ignoreKeyword.setValue(responseData.ignoreKeyword);
        }
    }

    async saveSettings(userKey: string){

        //Build request object from observable properties
        const reqData: SetSettingsData = {

            userKey: userKey,
            requestBody: {
                resizerEnabled: this.#resizerEnabled.getValue(),
                converterEnabled: this.#converterEnabled.getValue(),
                convertMode: this.#convertMode.getValue() as ConvertMode,
                convertQuality: this.#convertQuality.getValue(),
                ignoreAspectRatio: this.#ignoreAspectRatio.getValue(),
                targetWidth: this.#targetWidth.getValue(),
                targetHeight: this.#targetHeight.getValue(),
                keepOriginals: this.#keepOriginals.getValue(),
                ignoreKeyword: this.#ignoreKeyword.getValue(),
            }
        }
        
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
}

export default MediaToolsContext; 
export const MEDIA_TOOLS_CONTEXT_TOKEN = new UmbContextToken<MediaToolsContext>("MediaToolsContext")