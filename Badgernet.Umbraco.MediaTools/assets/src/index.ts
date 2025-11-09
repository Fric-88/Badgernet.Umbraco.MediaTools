import { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';


// load up the manifests here.
import { manifests as dashboardManifests } from './dashboards/manifest.ts';
import { manifests as contextManifests } from './context/manifest.ts';
import { client } from './api/client.gen.js';

const manifests: Array<UmbExtensionManifest> = [
    ...dashboardManifests,
	...contextManifests

];

export const onInit: UmbEntryPointOnInit = (_host, extensionRegistry) => {
    
    // register manifests here. 
    extensionRegistry.registerMany(manifests);

	// consume auth context here
    _host.consumeContext(UMB_AUTH_CONTEXT, (_authContext) => {
		if (!_authContext) return;

		const config = _authContext.getOpenApiConfiguration();

		client.setConfig({
			auth: config.token,
			baseUrl: config.base,
			credentials: config.credentials,
		});

		client.interceptors.request.use(async (request, _options) => {
			const token = await _authContext.getLatestToken();
			request.headers.set('Authorization', `Bearer ${token}`);
			return request;
		});
		
	});
};
