import {
	TFile,
} from "obsidian";

export type Kubos = {

	internals : string[],
	externals : string[],
	internals_url? : string[],
	externals_url? : string[],
}

export class SGFile extends TFile {
	raw: string
	// object?: { [key:string] : string }
	// cid?: string
}


export interface SGContentItem {

	author: string,
	publication:  string,
	sgId : string,
	post_type: string,
	tags: string[],
	categories: string[],
	parent: string,
	creation_date: string,
	modified_date: string,
	thumbnail: string,
	title: string,
	content: string

}

export interface SGTask {

	slug: string,
	author: string,
	payload: any,
	post_type: string,
	publication: string
}
