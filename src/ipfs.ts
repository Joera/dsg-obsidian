import axios from "axios";
import { Kubos, SGContentItem, SGFile } from "./types";
import { Settings } from './settings'



export const dagPutContentItem = async (contentItem: SGContentItem, archive_cid: string, kubos: Kubos) : Promise<[SGContentItem, string, string]>=> {

	if(kubos.externals_url != undefined) {

		let content_cids: string[]  = [];

		for (let kubo of kubos.externals_url) {

			const endpoint = kubo + '/api/v0/dag/put?store-codec=dag-cbor&input-codec=dag-json';

			let res = await axios.post(endpoint, { body : JSON.stringify(contentItem) }, {
				headers: {
					"Content-Type": "multipart/form-data",
				}
			})

			content_cids.push(res.data["Cid"]["/"]);

		}

		return [contentItem, archive_cid, content_cids[0]];

	}
	
	throw Error('no kubos to upload to')
	
}