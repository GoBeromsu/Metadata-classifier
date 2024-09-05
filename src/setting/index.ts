import AutoClassifierPlugin from 'main';
import { PluginSettingTab, Setting } from 'obsidian';
import { Provider } from 'types/APIInterface';

import { MetaDataManager } from 'metaDataManager';

import { APISetting } from './apiSetting';
import { TagSetting } from './tagSetting';
import { FrontmatterSetting } from './frontmatterSettings';
import { DEFAULT_FRONTMATTER_SETTING, Frontmatter } from 'constant';

export interface AutoClassifierSettings {
	providers: Provider[];
	selectedProvider: string;
	selectedModel: string;
	frontmatter: Frontmatter[];
}

export class AutoClassifierSettingTab extends PluginSettingTab {
	plugin: AutoClassifierPlugin;
	metaDataManager: MetaDataManager;
	apiSetting: APISetting;
	tagSetting: TagSetting;
	frontmatterSetting: FrontmatterSetting;
	constructor(plugin: AutoClassifierPlugin, metaDataManager: MetaDataManager) {
		super(plugin.app, plugin);
		this.plugin = plugin;
		this.metaDataManager = metaDataManager;
		this.apiSetting = new APISetting(plugin);
		this.tagSetting = new TagSetting(plugin, metaDataManager);
		this.frontmatterSetting = new FrontmatterSetting(plugin, metaDataManager);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// API Settings Section
		const apiSettingContainer = containerEl.createDiv();
		this.apiSetting.display(apiSettingContainer);

		// Add button to create new frontmatter entry
		new Setting(containerEl)
			.setName('Add Frontmatter')
			.setDesc('Add a new frontmatter entry')
			.addButton((button) =>
				button
					.setButtonText('Add Frontmatter')
					.setCta()
					.onClick(() => {
						if (!containerEl.querySelector('h2')) {
							containerEl.createEl('h2', { text: 'Frontmatter Settings' });
						}
						// Add a thin divider line after the second frontmatter
						if (this.plugin.settings.frontmatter.length >= 2) {
							containerEl.createEl('hr', { cls: 'thin-divider' });
						}
						const newFrontmatter = { ...DEFAULT_FRONTMATTER_SETTING, id: this.generateId() };
						this.plugin.settings.frontmatter.push(newFrontmatter);
						this.plugin.saveSettings();

						const newFrontmatterContainer = containerEl.createDiv();
						this.frontmatterSetting.display(newFrontmatterContainer, newFrontmatter.id);
						this.addDeleteButton(newFrontmatterContainer, newFrontmatter.id);
					})
			);

		// Frontmatter Settings Section
		const tagSettingContainer = containerEl.createDiv();
		this.tagSetting.display(tagSettingContainer);

		// Display existing frontmatter settings
		this.plugin.settings.frontmatter.forEach((frontmatter) => {
			const frontmatterContainer = containerEl.createDiv();
			this.frontmatterSetting.display(frontmatterContainer, frontmatter.id);
			this.addDeleteButton(frontmatterContainer, frontmatter.id);
		});
	}

	private generateId(): number {
		return Date.now();
	}

	private addDeleteButton(container: HTMLElement, frontmatterId: number): void {
		new Setting(container).addButton((button) =>
			button
				.setButtonText('Delete')
				.setWarning()
				.onClick(() => {
					// Remove the frontmatter data from settings
					this.plugin.settings.frontmatter = this.plugin.settings.frontmatter.filter(
						(f) => f.id !== frontmatterId
					);
					this.plugin.saveSettings();
					// Remove the container element
					container.remove();
				})
		);
	}
}
