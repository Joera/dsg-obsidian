import { DSGPublicationInput } from './note';
import { filePut } from './ipfs'
import { Kubos } from '../types'

export const cars = async (pubInput: DSGPublicationInput, kubos: Kubos) : Promise<DSGPublicationInput>  =>  {

    console.log(kubos);

    await createFromPath("templates",pubInput.templates);
    await createFromPath("assets", pubInput.assets);

 //   setTimeout( async () => {

 if (kubos.externals_url != undefined) {
 
    for (let kubo of kubos.externals_url) {
    
        pubInput.templates = await filePut("/home/joera/Documents/transport-union/fluence_tusg/publication/cars/templates.car", kubo);
        pubInput.assets = await filePut("/home/joera/Documents/transport-union/fluence_tusg/publication/cars/assets.car", kubo);
    
    }

}
    // }, 1000);

    return pubInput;
}

const createFromPath = async (fileName: string, path: string)  => {

    return new Promise( (resolve, reject) => {

        const exec = require('child-process-promise').exec;
        const cmd = `/home/joera/.cargo/bin/car-utils ar -c /home/joera/Documents/transport-union/fluence_tusg/publication/cars/${fileName}.car -s ${path}`;
        const promise = exec(cmd, { cwd: path, stdio: 'inherit', shell: true }); 
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