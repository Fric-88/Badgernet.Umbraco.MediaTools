﻿import type { ManifestDashboard } from "@umbraco-cms/backoffice/extension-registry";

const dashboards: Array<ManifestDashboard> = [
    {
        type: 'dashboard',
        name: 'Badgernet.Umbraco.MediaTools',
        alias: 'Badgernet.Umbraco.MediaTools.GalleryWorkerDashboard',
        elementName: 'GalleryWorkerDashboard',
        js: ()=> import('./gallery_dash.element.js'),
        weight: -10,
        meta: {
            label: '🗃️ Gallery',
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
        js: ()=> import('./upload_dash.element.js'),
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
    }
]

export const manifests = [...dashboards];