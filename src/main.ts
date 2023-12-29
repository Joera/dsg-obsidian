import { NoteController } from "./note.controller";
import { PublicationController } from "./publication.controller";
import { AuthorController } from "./author.controller";

import {
	FileSystemAdapter,
	Plugin,
} from "obsidian";

import { FilePublisherTab, DEFAULT_SETTINGS, Settings } from './settings'

export default class IpfsFluencePublishPlugin extends Plugin {

	settings: Settings;

	async onload() {

		console.log(this);

        this.addSettingTab(new FilePublisherTab(this.app, this));
		await this.loadSettings();

		const noteCtrlr = new NoteController();
		const publicationCtrlr = new PublicationController();
		const authorCtrlr = new AuthorController();

		var platform = require('platform');

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {

				menu.addItem((item) => {
					item
						.setTitle("Distribute note")
						.setIcon("document")
						.onClick(() => noteCtrlr.distributeNote(this.app, file))
				});
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {

				menu.addItem((item) => {
					item
						.setTitle("Update publication")
						.setIcon("document")
						.onClick(() => publicationCtrlr.update(this.app, file))
				});
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {

				menu.addItem((item) => {
					item
						.setTitle("Update author")
						.setIcon("document")
						.onClick(() => authorCtrlr.update(this.app, file))
				});
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {

				menu.addItem((item) => {
					item
						.setTitle("Bulk upload publication")
						.setIcon("document")
						.onClick(() => publicationCtrlr.bulk(this.app))
				});
			})
		);

		
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}


}

