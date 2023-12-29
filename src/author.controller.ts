import { App, FileManager, Menu, Notice, TAbstractFile, Vault, Workspace } from 'obsidian';
import { Settings } from './settings';

import * as E from "fp-ts/lib/Either";
import { Lazy, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { DSGAuthorInput, _parseAuthor, insertPubCid } from './publication/note';
import { Kubos, SGFile } from './types';
import { gatherKubos } from './publication/fluence';
import { upload, uploadAndMerge } from './publication/config';


const TEthunk = <A>(f: Lazy<Promise<A>>) => TE.tryCatch(f, E.toError);

const log =
	(msg: string) =>
	<A>(a: A) => {
		console.log(msg);
		return a;
	};


export class AuthorController {

    instructor() {}

    async update(app: App, file: TAbstractFile) {

        if (!("extension" in file)) {
            return;
        }

        const kubos = await gatherKubos();
 			    
        return pipe(
            file,
            // log("Adding note..."),
            TE.fromNullable(new Error("File not found")),
            TE.chain(parseAuthor(app.vault)),
            TE.chain(uploadMappings(app.workspace, kubos)),
            // TE.chain(uploadAuth(app)),
            TE.match(	
                (e) => notify(e, "failed to update author"),
                () => notify(undefined, "author has been updated")
            ),
        )()       
    }
}

const parseAuthor = (vault: Vault) => 
	(file: SGFile) : TE.TaskEither<Error,DSGAuthorInput> => 
		pipe(
			TE.right(file),
			TE.chain((file) => TEthunk(() => _parseAuthor(file, vault))),
			TE.chain((authInput) => TE.right(authInput))
		);

const uploadMappings = (workspace: Workspace, kubos: Kubos) => 
    (auth: DSGAuthorInput ) : TE.TaskEither<Error,DSGAuthorInput> => 
    pipe(
        TE.right({}),
        TE.chain(() => TEthunk(() => uploadAndMerge(auth, kubos)))
    );
    
// const uploadAuth = (app: App, kubos: Kubos) => 
// 	(auth: DSGAuthorInput ) : TE.TaskEither<Error,string> => 
// 		pipe(
// 			TE.right({}),
// 			TE.chain((cid) => TEthunk(() => insertPubCid(app.workspace, cid, app.fileManager))),
// 			TE.chain((cid) => TE.right(cid))
// 		);
    
        


	
const notify = (e: Error | undefined, msg: string) => {
	console.log(msg);

	if (e) {
		console.error(e);
	}

	new Notice(msg);
};
