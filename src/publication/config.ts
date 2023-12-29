import { readFile } from "fs/promises";
import { DSGAuthorInput, DSGPublicationInput } from "./note";
import { dagPut, filePut } from "./ipfs";
import * as fs from 'fs';
import { Kubos } from "src/types";

type DSGCollection = {
    source: string,
    key: string
    query: string
}

type DSGTemplate = {
    reference: string
    file: string
    path: string
    collections: DSGCollection[]
}

export type  DSGPublication = {
    name: string
    governor: string
    domains: any[]
    assets: string
    templates: string
    mapping: DSGTemplate[]
}

export const publicationConfig = async (pubInput: DSGPublicationInput) :  Promise<DSGPublication> => {
  
    let content = fs.readFileSync(pubInput.mapping, "utf8");

    let domain = {
        url: "unamore.publikaan.nl",
        dns: {
            custodian: "digitalocean",
            item_id: "xxx",
            auth_key: "xxx"
        }
    }

   return  {
        assets: pubInput.assets,
        name: pubInput.name,
        governor: pubInput.governor,
        domains: [domain],
        templates: pubInput.templates,
        mapping: JSON.parse(content)
    }
}

export const upload = async (input: any, kubos: Kubos) :  Promise<string> => {

        let cids : string[] = [];

        if (kubos.externals_url != undefined) {

            for (let kubo of kubos.externals_url) {
                cids.push(await dagPut(input, kubo));
            }
        }

        return cids[0]  
}       

export const uploadAndMerge = async (input: DSGAuthorInput, kubos: Kubos) :  Promise<DSGAuthorInput> => {

    let content = fs.readFileSync(input.content_mappings, "utf8");

    let json = JSON.parse(content);

    input.content_mappings = await upload(
        json,
        kubos
    );

    return input;      
}    