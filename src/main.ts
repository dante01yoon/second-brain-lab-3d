import { Plugin } from "obsidian";
import { BrainSettingsTab, DEFAULT_SETTINGS, type PluginSettings } from "./settings";
import { BrainView, VIEW_TYPE } from "./view";

export default class SecondBrainLabPlugin extends Plugin {
  settings: PluginSettings = { ...DEFAULT_SETTINGS };

  async onload(): Promise<void> {
    const stored = (await this.loadData()) as Partial<PluginSettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...stored };
    if (this.settings.language !== "en" && this.settings.language !== "ko")
      this.settings.language = "en";
    if (!Number.isInteger(this.settings.maxNotes))
      this.settings.maxNotes = DEFAULT_SETTINGS.maxNotes;
    this.settings.maxNotes = Math.max(50, Math.min(5000, this.settings.maxNotes));

    this.registerView(VIEW_TYPE, (leaf) => new BrainView(leaf, this));
    this.addRibbonIcon("orbit", "Open Second Brain Lab 3D", () => void this.openView());
    this.addCommand({
      id: "open-3d-view",
      name: "Open 3D view",
      callback: () => void this.openView(),
    });
    this.addSettingTab(new BrainSettingsTab(this.app, this));

    this.registerEvent(this.app.vault.on("create", () => this.refreshViews()));
    this.registerEvent(this.app.vault.on("delete", () => this.refreshViews()));
    this.registerEvent(this.app.vault.on("rename", () => this.refreshViews()));
    this.registerEvent(this.app.vault.on("modify", () => this.refreshViews()));
    this.registerEvent(this.app.metadataCache.on("resolved", () => this.refreshViews()));
  }

  async onunload(): Promise<void> {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.refreshViews();
  }

  private refreshViews(): void {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
      if (leaf.view instanceof BrainView) leaf.view.scheduleRefresh();
    }
  }

  private async openView(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (existing) {
      this.app.workspace.revealLeaf(existing);
      return;
    }
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE, active: true });
    await this.app.workspace.revealLeaf(leaf);
  }
}
