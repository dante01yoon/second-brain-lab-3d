import { App, PluginSettingTab, Setting } from "obsidian";
import type SecondBrainLabPlugin from "./main";
import { copy, type UiLanguage } from "./i18n";

export interface PluginSettings {
  language: UiLanguage;
  folder: string;
  maxNotes: number;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  language: "en",
  folder: "",
  maxNotes: 1000,
};

export class BrainSettingsTab extends PluginSettingTab {
  constructor(app: App, private plugin: SecondBrainLabPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    const t = copy[this.plugin.settings.language];
    new Setting(containerEl)
      .setName(t.settingsLanguage)
      .setDesc(t.settingsLanguageDesc)
      .addDropdown((dropdown) =>
        dropdown
          .addOption("en", "English")
          .addOption("ko", "한국어")
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value as UiLanguage;
            await this.plugin.saveSettings();
            this.display();
          }),
      );
    new Setting(containerEl)
      .setName(t.settingsFolder)
      .setDesc(t.settingsFolderDesc)
      .addText((field) =>
        field
          .setPlaceholder("knowledge/react")
          .setValue(this.plugin.settings.folder)
          .onChange(async (value) => {
            this.plugin.settings.folder = value.trim().replace(/^\/+|\/+$/g, "");
            await this.plugin.saveSettings();
          }),
      );
    new Setting(containerEl)
      .setName(t.settingsMax)
      .setDesc(t.settingsMaxDesc)
      .addText((field) =>
        field
          .setPlaceholder("1000")
          .setValue(String(this.plugin.settings.maxNotes))
          .onChange(async (value) => {
            const number = Number(value);
            if (!Number.isInteger(number) || number < 50 || number > 5000) return;
            this.plugin.settings.maxNotes = number;
            await this.plugin.saveSettings();
          }),
      );
  }
}
