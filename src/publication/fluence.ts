import { SGFile } from "../types";
import { Kubos } from "./ipfs";


export const gatherKubos = async () : Promise<Kubos> => {

	return new Promise( async (resolve, reject) => {

		// const exec = require('child-process-promise').exec;
		// const path = "/home/joera/Documents/transport-union/fluence_tusg";
		// const cmd = `source /home/joera/.nvm/nvm.sh && nvm use 18 >/dev/null && fluence run -f 'gatherKubos()'`;


		// console.log(path);

		// // had to add symlink: 
		// // sudo ln -s /home/joera/.nvm/versions/node/v16.20.1/bin/fluence /usr/bin/fluence

		// const promise = exec(cmd, { cwd : path, stdio: 'inherit', shell: true }); 
		// const childProcess = promise.childProcess;

		// childProcess.stdout.on('data', function (data: any) {

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