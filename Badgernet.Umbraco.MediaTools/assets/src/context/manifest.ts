import { ManifestGlobalContext } from "@umbraco-cms/backoffice/extension-registry";

const contexts : Array<ManifestGlobalContext> = [
    {
        type: 'globalContext',
        alias: 'MediaToolsContext',
        name: 'MediaTools context',
        js: () => import('./mediatools.context.ts')
    }
]

export const manifests = [...contexts];