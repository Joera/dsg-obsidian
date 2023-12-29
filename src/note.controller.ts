import { App, FileManager, Menu, Notice, TAbstractFile, TFile, Vault, Workspace } from 'obsidian';
import { Settings } from './settings';

import * as E from "fp-ts/lib/Either";
import { Lazy, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { SGFile, SGTask} from './types';
import { gatherKubos, render } from './note/fluence';
import { dagPutContentItem } from './ipfs';
import { parseNote, insertCid, createTask, saveRoot, includeUrl } from './note/note';
import { Kubos } from './types';
import { localhost } from './note/host';

const TEthunk = <A>(f: Lazy<Promise<A>>) => TE.tryCatch(f, E.toError);

const log =
	(msg: string) =>
	<A>(a: A) => {
		console.log(msg);
		return a;
	};


export class NoteController {

    instructor() {}

    async distributeNote(app: App, file: TAbstractFile) {

        if (!("extension" in file)) {
            return;
        }

		const kubos = await gatherKubos();
 			    
        return pipe(
            file,
            // log('distributing note'),
            TE.fromNullable(new Error("File not found")),
            TE.chain(prepareNote(app, kubos)),
            TE.chain(callToRender(app)),
            TE.match(	
                (e) => notify(e, "failed to publish"),
                ([task,url]) => notify(undefined, url)
            )
        )()       
    }
}

export const prepareNote =
	(app: App, kubos: Kubos) => (file: TFile) : TE.TaskEither<Error,[TFile, SGTask, string]> =>  
		pipe(
			TE.right(file),
			TE.chain((file) => TEthunk(() => parseNote(app, file))),
			TE.chain(([contentItem, archive_cid]) => TEthunk(() => dagPutContentItem(contentItem, archive_cid, kubos))),
			TE.chain(([contentItem, archive_cid, content_cid]) => TEthunk(() => insertCid(file, contentItem, archive_cid, content_cid, app.fileManager))),
            TE.chain(([contentItem, archive_cid]) => TEthunk(() => createTask(file, contentItem, archive_cid)))
			
			// 
		);
		
		
	const callToRender =
	(app: App) => ([file, task, archive_cid]:[TFile, SGTask, string]) : TE.TaskEither<Error,[SGTask, string]> =>
	pipe(
		TE.right(task), 
		TE.chain(() => TEthunk(() => render(file, task, archive_cid, app.vault, app.fileManager))),
		TE.chain(([new_archive_cid, url]) => TEthunk(() => saveRoot(new_archive_cid, url, file, app.vault, app.fileManager))),
		TE.chain(([new_archive_cid, url]) => TEthunk(() => localhost(new_archive_cid, url))),
		TE.chain((url) => TEthunk(() => includeUrl(url, file, app.vault, app.fileManager))),
		TE.chain((url) => TE.right([task, url]))
	);
	
const notify = (e: Error | undefined, msg: string) => {
	console.log(msg);

	if (e) {
		console.error(e);
	}

	new Notice(msg);
};
