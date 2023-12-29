import {
	App,
	PluginSettingTab,
	Setting,
} from "obsidian";

export interface Settings {
	url: string;
	apiKey: string;
	apiSecret: string;
}

export const DEFAULT_SETTINGS: Settings = {
	url: "",
	apiKey: "",
	apiSecret: "",
};

export class FilePublisherTab extends PluginSettingTab {
	
	plugin: any;

	constructor(app: App, plugin: any) {
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
