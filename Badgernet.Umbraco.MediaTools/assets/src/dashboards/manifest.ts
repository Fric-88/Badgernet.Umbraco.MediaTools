import type { ManifestDashboard } from "@umbraco-cms/backoffice/extension-registry";

const dashboards: Array<ManifestDashboard> = [
    {
        type: 'dashboard',
        name: 'Badgernet.Umbraco.MediaTools',
        alias: 'Badgernet.Umbraco.MediaTools.GalleryWorkerDashboard',
        elementName: 'GalleryWorkerDashboard',
        js: ()=> import('./galleryDashboard.element.ts'),
        weight: -10,
        meta: {
            label: '🔍️ My Media',
            pathname: 'mediatools-gallery'
        },
        conditions: [
            {
                alias: 'Umb.Condition.SectionAlias',
                match: 'Umb.Section.Media'
            }
        ]
    },
    {
        type: 'dashboard',
        name: 'Badgernet.Umbraco.MediaTools',
        alias: 'Badgernet.Umbraco.MediaTools.UploadWorkerDashboard',
        elementName: 'UploadWorkerDashboard',
        js: ()=> import('./processingDashboard.element.ts'),
        weight: -10,
        meta: {
            label: '♾️ Upload processing',
            pathname: 'mediatools-uploads'
        },
        conditions: [
            {
                alias: 'Umb.Condition.SectionAlias',
                match: 'Umb.Section.Media'
            }
        ]
    },
    {
        type: 'dashboard',
        name: 'Badgernet.Umbraco.MediaTools',
        alias: 'Badgernet.Umbraco.MediaTools.FoldersDashboard',
        elementName: 'UploadWorkerDashboard',
        js: ()=> import('./foldersDashboard.element.ts'),
        weight: -10,
        meta: {
            label: '📁 Folder Rules',
            pathname: 'mediatools-folders'
        },
        conditions: [
            {
                alias: 'Umb.Condition.SectionAlias',
                match: 'Umb.Section.Media'
            }
        ]
    }
]

export const manifests = [...dashboards];