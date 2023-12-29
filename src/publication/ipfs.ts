import { readFile } from 'node:fs/promises';
import axios from "axios";
import { SGFile } from "../types";


export const dagPut = async (o: any, kubo_address: string) : Promise<string> => {

	return new Promise ( async (resolve, reject) => {
	
		const endpoint = kubo_address + '/api/v0/dag/put';

		const json = JSON.stringify(o);

		const exec = require('child-process-promise').exec;
		const cmd = `/usr/bin/curl -X POST -F file='${json}' ${endpoint}`;
		const promise = exec(cmd, { stdio: 'inherit', shell: true }); 
		const childProcess = promise.childProcess;

		childProcess.stdout.on('data', function (res: any) {
			// console.log(res);		
			const json = JSON.parse(res);
			resolve(json["Cid"]["/"]);
		});
	});
}

export const filePut = async (path: string, kubo: string) : Promise<string> => {

	return new Promise ( async (resolve, reject) => {

		const exec = require('child-process-promise').exec;
		const cmd = `/usr/bin/curl -X POST -F file=@${path} ${kubo}/api/v0/add`;
		const promise = exec(cmd, { stdio: 'inherit', shell: true }); 
		const childProcess = promise.childProcess;

		childProcess.stdout.on('data', function (data: any) {
			const json = JSON.parse(data.toString());
			resolve(json['Hash']);
		});
	});

};


