import {
	FileManager,
	MarkdownView,
	Vault,
	Workspace,
} from "obsidian";
	
import { SGFile } from "../types";

import * as YAML from 'yaml'
import { filePut } from "./ipfs";
import { Kubos} from "../types";


type DSGDns = {

	custodian: string,
	item_id: string,
	auth_key: string,
}

type DSGDomain = {

	url: string,
	dns: DSGDns
}

export type DSGPublicationInput = {
	name : string,
	governor: string,
	type : string,
	domains: DSGDomain[],
	templates : string,
	assets : string,
	mapping : string,
};

export type DSGAuthorInput = {
	name : string,
	repository: string,
	content_mappings: string
};

export const _parseAuthor =  async (file: SGFile, vault: Vault) : Promise<DSGAuthorInput> =>   {

	const fileContent = await vault.read(file)

	let frontmatter_str = fileContent.split("---")[1];
	let properties: { [key: string] : string };

	if (frontmatter_str == undefined) {
		throw Error("proporties incorrect");
	}
		
	properties = YAML.parse(frontmatter_str);

	return  {
		name : properties.name,
		repository: properties.repository,
		content_mappings : properties.mapping
	}
}

export const _parsePublication =  async (file: SGFile, vault: Vault) : Promise<DSGPublicationInput> =>   {

	const fileContent = await vault.read(file)

	let frontmatter_str = fileContent.split("---")[1];
	let properties: { [key: string] : string };

	if (frontmatter_str == undefined) {
		throw Error("proporties incorrect");
	}
		
	properties = YAML.parse(frontmatter_str);

	return  {
		name : properties.name,
		governor: properties.governor,
		type : properties.type,
		domains : [],
		templates : properties.templates,
		assets : properties.assets,
		mapping : properties.mapping,
	}
}

export const insertPubCid = async (workspace: Workspace, cid: string, fileManager: FileManager)  => {

	let file = workspace.getActiveFile();

	if (file == null) return cid;
	await fileManager.processFrontMatter( file, (frontmatter) => {
		frontmatter["config"] = cid;
	})

	return cid;
}



export const _uploadMapping = async (authInput: any, kubos: Kubos):  Promise<any> => {

	const cids = [];

	if (kubos.externals_url != undefined) {

		for (let kubo of kubos.externals_url) {
			cids.push(await filePut(authInput.content_mappings, kubo));
		}
	}

	authInput.content_mappings = cids[0]  
		
	return authInput;

}


