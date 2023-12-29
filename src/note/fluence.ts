import { showBoolean } from "fp-ts/lib/Show";
import { SGFile, SGTask } from "../types";
import { includeUrl, saveRoot } from "./note";
import { FileManager, TAbstractFile, TFile, Vault } from "obsidian";
import slugify  from "slugify";

type Kubos = {

	internals : string[],
	externals : string[],
	internals_url? : string[],
	externals_url? : string[],
}


export const bulkUpload = async(tasks: SGTask[]) => {

	// either do queue by 20's or bulk insert on table

	let batches: number = Math.round(tasks.length / 10) + 1; 

	return new Promise( async (resolve, reject) => {

		let results : string[]  = [];

		for (let i = 0; i <= batches; i++) {

			let res = await fetch("http://127.0.0.1:3099/bulk", {
				method: "post",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ tasks: tasks.slice((10 * i),(10 * (i + 1)))})
			});

			results = results.concat(await res.json())

		}

		resolve(results);

	});
}



export const render = async (file: TFile, task: SGTask, archive_cid: string, vault: Vault, fileManager: FileManager) : Promise<[string, string]> => {

	return new Promise( async (resolve, reject) => {
	
		let res = await fetch("http://127.0.0.1:3099/render", {
			method: "post",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ task, archive_cid})
		});

		let data = (await res.json()).reverse();

		const new_archive_cid = data[0].results.reverse()[0];

		let url = "";

		// je moet de eerste hebben want ripples
		if (data[data.length - 1].results.length > 0) {
			url = data[data.length - 1].results[0].split(" ");
			url = url[url.length - 1];
			url = url.replace("/html/unamore","http://localhost:8765");
		}

		resolve([new_archive_cid, url]);
	});
	                                                                 
}

export const gatherKubos = async () : Promise<Kubos> => {

	return new Promise( async (resolve, reject) => {

		let res = await fetch("http://127.0.0.1:3099/gather_kubos", {
			method: "post",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({})
		});
	
		const data = await res.json();

		let kubos: Kubos; 

		try {

				const kubos : any =  {};
				kubos.internals_url = [];
				kubos.externals_url = [];

				for (let multiaddress of data.internals) {
				let snips = multiaddress.split("/");
				
				kubos.internals_url.push('http://' + snips[2] + ":" + snips[4])
				}	

				for (let multiaddress of data.externals) {
				let snips = multiaddress.split("/");
				kubos.externals_url.push('http://' + snips[2] + ":" + snips[4])
				}		
		
				resolve(kubos);

		} catch (e) {
			
			console.log(e);
		}
	});    
}