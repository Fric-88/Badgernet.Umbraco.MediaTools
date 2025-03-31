// This file is auto-generated by @hey-api/openapi-ts

export type ConvertMode = 'Lossy' | 'Lossless';

export type ConverterSettings = {
    enabled: boolean;
    convertMode: ConvertMode;
    convertQuality: number;
};

export type EventMessageTypeModel = 'Default' | 'Info' | 'Error' | 'Success' | 'Warning';

export type FilterImagesDto = {
    folderName?: string | null;
    width: number;
    height: number;
    nameLike: string;
    extensionLike: string;
    sizeFilter: SizeFilter;
};

export type GalleryInfoDto = {
    mediaCount: number;
    folderCount: number;
    countByExtension: Array<(KeyValuePair_2)>;
};

export type GeneralSettings = {
    keepOriginals: boolean;
    ignoreKeyword: string;
};

export type ImageMediaDto = {
    id: number;
    name: string;
    width: number;
    height: number;
    extension: string;
    path: string;
    size: string;
};

export type ImageMetadataDto = {
    verticalResolution: number;
    horizontalResolution: number;
    decodedImageFormat: string;
    resolutionUnits: string;
    exifTags: Array<(ParsedTag)>;
    iptcTags: Array<(ParsedTag)>;
    xmpProfile: string;
};

export type KeyValuePair_2 = {
    key?: string | null;
    value: number;
};

export type MediaFolderDto = {
    name: string;
    path: string;
};

export type MetadataRemoverSettings = {
    enabled: boolean;
    removeDateTime: boolean;
    removeCameraInfo: boolean;
    removeGpsInfo: boolean;
    removeShootingSituationInfo: boolean;
    removeXmpProfile: boolean;
    removeIptcProfile: boolean;
    metadataTagsToRemove: Array<(string)>;
};

export type NotificationHeaderModel = {
    message: string;
    category: string;
    type: EventMessageTypeModel;
};

export type OperationResponse = {
    status: ResponseStatus;
    message: string;
    payload?: unknown;
};

export type ParsedTag = {
    tag: string;
    value: string;
};

export type ProcessImagesDto = {
    ids: Array<(number)>;
    resize: boolean;
    convert: boolean;
    resizeMode: ResizeMode;
    width: number;
    height: number;
    convertMode: ConvertMode;
    convertQuality: number;
};

export type ResizeMode = 'FitInside' | 'ExactSize';

export type ResizerSettings = {
    enabled: boolean;
    ignoreAspectRatio: boolean;
    targetWidth: number;
    targetHeight: number;
};

export type ResponseStatus = 'Success' | 'Error' | 'Skipped' | 'Warning';

export type SizeFilter = 'AllSizes' | 'BiggerThan' | 'SmallerThan';

export type UserSettingsDto = {
    resizer: ResizerSettings;
    converter: ConverterSettings;
    metadataRemover: MetadataRemoverSettings;
    general: GeneralSettings;
};

export type DownloadMediaData = {
    requestBody?: Array<(number)>;
};

export type DownloadMediaResponse = (Blob | File);

export type FilterGalleryData = {
    requestBody?: FilterImagesDto;
};

export type FilterGalleryResponse = Array<(ImageMediaDto)>;

export type GetGalleryInfoResponse = GalleryInfoDto;

export type GetMetadataData = {
    id?: number;
};

export type GetMetadataResponse = ImageMetadataDto;

export type ListFoldersResponse = Array<(MediaFolderDto)>;

export type GetMediaInfoData = {
    mediaId?: number;
};

export type GetMediaInfoResponse = ImageMediaDto;

export type ProcessImagesData = {
    requestBody?: ProcessImagesDto;
};

export type ProcessImagesResponse = OperationResponse;

export type RenameMediaData = {
    mediaId?: number;
    newName?: string;
};

export type RenameMediaResponse = OperationResponse;

export type ReplaceImageData = {
    formData?: {
        imageFile?: (Blob | File);
    };
    id?: number;
    saveAs?: string;
};

export type ReplaceImageResponse = OperationResponse;

export type RecycleMediaData = {
    requestBody?: Array<(number)>;
};

export type RecycleMediaResponse = OperationResponse;

export type GetSettingsData = {
    userKey?: string;
};

export type GetSettingsResponse = UserSettingsDto;

export type SetSettingsData = {
    requestBody?: UserSettingsDto;
    userKey?: string;
};

export type SetSettingsResponse = string;

export type $OpenApiTs = {
    '/gallery/download': {
        post: {
            req: DownloadMediaData;
            res: {
                /**
                 * OK
                 */
                200: (Blob | File);
            };
        };
    };
    '/gallery/filter': {
        post: {
            req: FilterGalleryData;
            res: {
                /**
                 * OK
                 */
                200: Array<(ImageMediaDto)>;
            };
        };
    };
    '/gallery/get-info': {
        get: {
            res: {
                /**
                 * OK
                 */
                200: GalleryInfoDto;
            };
        };
    };
    '/gallery/getMetadata': {
        get: {
            req: GetMetadataData;
            res: {
                /**
                 * OK
                 */
                200: ImageMetadataDto;
            };
        };
    };
    '/gallery/list-folders': {
        get: {
            res: {
                /**
                 * OK
                 */
                200: Array<(MediaFolderDto)>;
            };
        };
    };
    '/gallery/mediaInfo': {
        get: {
            req: GetMediaInfoData;
            res: {
                /**
                 * OK
                 */
                200: ImageMediaDto;
                /**
                 * Bad Request
                 */
                400: ImageMediaDto;
            };
        };
    };
    '/gallery/process': {
        post: {
            req: ProcessImagesData;
            res: {
                /**
                 * OK
                 */
                200: OperationResponse;
                /**
                 * Bad Request
                 */
                400: OperationResponse;
            };
        };
    };
    '/gallery/rename': {
        post: {
            req: RenameMediaData;
            res: {
                /**
                 * OK
                 */
                200: OperationResponse;
                /**
                 * Bad Request
                 */
                400: OperationResponse;
            };
        };
    };
    '/gallery/replace': {
        post: {
            req: ReplaceImageData;
            res: {
                /**
                 * OK
                 */
                200: OperationResponse;
                /**
                 * Bad Request
                 */
                400: OperationResponse;
            };
        };
    };
    '/gallery/trash': {
        post: {
            req: RecycleMediaData;
            res: {
                /**
                 * OK
                 */
                200: OperationResponse;
            };
        };
    };
    '/settings/get': {
        get: {
            req: GetSettingsData;
            res: {
                /**
                 * OK
                 */
                200: UserSettingsDto;
            };
        };
    };
    '/settings/set': {
        post: {
            req: SetSettingsData;
            res: {
                /**
                 * OK
                 */
                200: string;
            };
        };
    };
};