import axios from "axios";
import YAML from 'yaml'
import * as E from "fp-ts/lib/Either";
import { Lazy, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as Str from "fp-ts/lib/string";
import * as TE from "fp-ts/lib/TaskEither";
import {
	App,
	FileSystemAdapter,
	MarkdownView,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TAbstractFile,
	TFile,
	Vault,
	Workspace,
} from "obsidian";

interface Settings {
	url: string;
	apiKey: string;
	apiSecret: string;
}

type DataObject = {

	fileName : string, 
	file : string, 
	object?: { [key:string] : string },
	cid?: string
}

const DEFAULT_SETTINGS: Settings = {
	url: "",
	apiKey: "",
	apiSecret: "",
};

const PUBLISHED_DIR = "published";

const TEthunk = <A>(f: Lazy<Promise<A>>) => TE.tryCatch(f, E.toError);

const log =
	(msg: string) =>
	<A>(a: A) => {
		console.log(msg);
		return a;
	};

export default class IpfsPublisher extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadSettings();

		const adapter = this.app.vault.adapter as FileSystemAdapter;
		const basePath = adapter.getBasePath();

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!("extension" in file)) {
					return;
				}

				const {url, apiKey, apiSecret} = this.settings;
				const token = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
				menu.addItem((item) => {
					item
						.setTitle("Add to IPFS")
						.setIcon("document")
						.onClick(() =>
							pipe(
								file,
								log("Adding note..."),
								TE.fromNullable(new Error("File not found")),
								TE.chain(publishFile(this.app.workspace, this.app.vault, url, token)),
								// TE.chain(insertCid(this.app.workspace)),
								TE.match(
									(e) => notify(e, "File failed to publish"),
									() => notify(undefined, "File has been published")
								)
							)()
						);
				});
			})
		);

		this.addSettingTab(new FilePublisherTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}



const request = async (url: string, data: any) => {

	delete data.object.cid;

	const endpoint = url + '/api/v0/dag/put?store-codec=dag-cbor&input-codec=dag-json';

	const payload = JSON.stringify(data.object);

	let res = await axios.post(endpoint, { body : payload }, {
		headers: {
			"Content-Type": "multipart/form-data",
			// Authorization: "Basic " + token,
		},
	})
	// wrap in Either
	console.log(res.data["Cid"]["/"]);
	data.cid = res.data["Cid"]["/"];
	return data;
}

const readNote = async (vault: Vault, file: TFile) => {

	let d = await vault.read(file)

	console.log(d);
	return d;

}

const parseNote =  async (data: DataObject) => {

	let frontmatter_str = data.file.split("---")[1];
	let object: { [key: string] : string };

	if (frontmatter_str !== undefined) {
		object = YAML.parse(frontmatter_str);
		object.content = data.file.split("---")[2];
	} else {
		object = {};
		object.content = data.file.split("---")[0];
	}

	object.title = data.fileName.replace(/\.[^/.]+$/, "");
	data.object = object;
	return data;
}


const publishFile =
	(workspace: Workspace, vault: Vault, url: string, token: string) => (file: TFile) =>
		pipe(
			TE.right({ fileName: file.name }),
			TE.bind("file", () => TEthunk(() => readNote(vault,file))),
			TE.chain((data) => TEthunk(() => parseNote(data))),
			TE.chain((data) => TEthunk(() => request(url,data))),
			TE.chain((data) => TEthunk(() => insertCid(workspace, data))),
			TE.chain(() => TE.right(file))
		);

const insertCid = async (workspace: Workspace, dataObject: DataObject)  => {

	const view = workspace.getActiveViewOfType(MarkdownView);
		if (view!=null) {
			const editor = view.editor;
			const editorText = editor.getValue();
			const frontmatter_str = editorText.split("---")[1];
			let object: { [key:string]: string | undefined}
			let content: string;

			if (frontmatter_str !== undefined) {
				object = YAML.parse(frontmatter_str);
				content = editorText.split("---")[2];
			} else {
				object = {};
				content = editorText;
			}
			object.cid = dataObject.cid;
			editor.setValue(`---
${YAML.stringify(object)}---${content}`);
		}

	return dataObject;
}


const notify = (e: Error | undefined, msg: string) => {
	console.log(msg);

	if (e) {
		console.error(e);
	}

	new Notice(msg);
};

class FilePublisherTab extends PluginSettingTab {
	plugin: IpfsPublisher;

	constructor(app: App, plugin: IpfsPublisher) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h3", { text: "File Publisher Settings" });

		new Setting(containerEl)
			.setName("Publisher url")
			.setDesc(
				"This should be a POST url where the file is sent as a multipart/form-data body to."
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter the url")
					.setValue(this.plugin.settings.url)
					.onChange(async (value) => {
						this.plugin.settings.url = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("API Key")
			.setDesc(
				"API Key used when posting a file to the URL. NOTE: this is passed as the user of the basic authorization header."
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter your key")
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("API Secret")
			.setDesc(
				"API Secret used when posting a file to the URL. NOTE: this is passed as the password of the basic authorization header."
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.apiSecret)
					.onChange(async (value) => {
						this.plugin.settings.apiSecret = value;
						await this.plugin.saveSettings();
					})
			);
	}
}