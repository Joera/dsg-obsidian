

export const localhost = async (new_archive_cid: string, url: string) : Promise<string> => {

    await fetchCar(new_archive_cid);
    setTimeout( async () => {
        await unpack();
    }, 1000);


    return url;
}

const fetchCar = async (cid: string) => {

	return new Promise( (resolve, reject) => {

		const path = "/home/joera/Documents/transport-union/fluence_tusg/publication";

        const exec = require('child-process-promise').exec;
        const cmd = `curl -X POST http://127.0.0.1:15001/api/v0/cat?arg=${cid} --output ${path}/archive.car`;
        const promise = exec(cmd, { cwd: "/usr/bin/", stdio: 'inherit', shell: true }); 
        const childProcess = promise.childProcess;

        childProcess.stdout.on('data', function (data: any) {
            console.log('[serve] stdout: ', data.toString());
            resolve(data.toString());
        });

        childProcess.stderr.on('data', function (data: any) {
            console.log('[serve] stderr: ', data.toString());
            reject(data.toString());
        });

        resolve("");
    });	

}
const unpack = async () => {

	return new Promise( (resolve, reject) => {

		const path = "/home/joera/Documents/transport-union/fluence_tusg/publication";

        const exec = require('child-process-promise').exec;
        const cmd = `bash ${path}/unpack.sh`;
        const promise = exec(cmd, {shell: '/bin/bash'}); 
        const childProcess = promise.childProcess;

        childProcess.stdout.on('data', function (data: any) {
            console.log('[serve] stdout: ', data.toString());
            resolve(data.toString());
        });

        childProcess.stderr.on('data', function (data: any) {
            console.log('[serve] stderr: ', data.toString());
            reject(data.toString());
        });

        resolve("whatever");
    });	

}

