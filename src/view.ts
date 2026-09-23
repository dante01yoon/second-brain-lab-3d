import { ItemView, MarkdownRenderer, TFile, WorkspaceLeaf } from "obsidian";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildGraph, type BrainGraph } from "./graph";
import { copy } from "./i18n";
import type SecondBrainLabPlugin from "./main";

export const VIEW_TYPE = "second-brain-lab-3d-view";

function hash(text: string): number {
  let value = 2166136261;
  for (const character of text)
    value = Math.imul(value ^ character.charCodeAt(0), 16777619);
  return value >>> 0;
}

function colorFor(group: string): THREE.Color {
  const hue = ((hash(group) % 360) + 155) % 360;
  return new THREE.Color().setHSL(hue / 360, 0.72, 0.68);
}

function positionFor(
  id: string,
  index: number,
  groupIndex: number,
  groupCount: number,
): THREE.Vector3 {
  const seed = hash(id);
  const angle = (groupIndex / Math.max(1, groupCount)) * Math.PI * 2;
  const radius = groupCount <= 1 ? 2 : 6;
  return new THREE.Vector3(
    Math.cos(angle) * radius + Math.cos(index * 2.4) * (2.5 + (seed % 1000) / 350),
    Math.sin(index * 1.9) * 3.4 + ((seed >> 10) % 300) / 100 - 1.5,
    Math.sin(angle) * radius + Math.sin(index * 2.4) * (2.3 + (seed % 700) / 300),
  );
}

export class BrainView extends ItemView {
  private graph: BrainGraph = { nodes: [], edges: [], totalMatching: 0, omitted: 0 };
  private selected: string | null = null;
  private search = "";
  private refreshTimer: number | null = null;
  private selectionEpoch = 0;
  private cleanup: Array<() => void> = [];
  private root!: HTMLElement;
  private stage!: HTMLElement;
  private list!: HTMLElement;
  private detail!: HTMLElement;
  private count!: HTMLElement;
  private hint!: HTMLElement;
  private searchInput!: HTMLInputElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private mesh: THREE.InstancedMesh | null = null;
  private links: THREE.LineSegments | null = null;
  private positions = new Map<string, THREE.Vector3>();
  private frameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  constructor(leaf: WorkspaceLeaf, private plugin: SecondBrainLabPlugin) {
    super(leaf);
  }

  getViewType(): string { return VIEW_TYPE; }
  getDisplayText(): string { return copy[this.plugin.settings.language].view; }
  getIcon(): string { return "orbit"; }

  async onOpen(): Promise<void> {
    const t = copy[this.plugin.settings.language];
    this.contentEl.empty();
    this.contentEl.addClass("sbl3d-host");
    this.root = document.createElement("div");
    this.root.className = "sbl3d-root";
    this.root.innerHTML = `
      <aside class="sbl3d-sidebar">
        <div class="sbl3d-brand"><span class="sbl3d-mark">✦</span> SECOND BRAIN <b>LAB</b></div>
        <h2 class="sbl3d-title"></h2>
        <p class="sbl3d-intro"></p>
        <div class="sbl3d-count"></div>
        <input class="sbl3d-search" type="search" autocomplete="off" />
        <div class="sbl3d-list"></div>
        <p class="sbl3d-privacy"></p>
      </aside>
      <section class="sbl3d-stage" aria-label="3D graph">
        <div class="sbl3d-canvas"></div>
        <div class="sbl3d-stage-top"><span class="sbl3d-live-dot"></span><span class="sbl3d-stage-count"></span></div>
        <button class="sbl3d-reload" type="button"></button>
        <div class="sbl3d-hint"></div>
      </section>
      <aside class="sbl3d-detail" aria-live="polite"></aside>`;
    this.contentEl.appendChild(this.root);
    this.stage = this.root.querySelector(".sbl3d-canvas") as HTMLElement;
    this.list = this.root.querySelector(".sbl3d-list") as HTMLElement;
    this.detail = this.root.querySelector(".sbl3d-detail") as HTMLElement;
    this.count = this.root.querySelector(".sbl3d-count") as HTMLElement;
    this.hint = this.root.querySelector(".sbl3d-hint") as HTMLElement;
    this.searchInput = this.root.querySelector(".sbl3d-search") as HTMLInputElement;
    (this.root.querySelector(".sbl3d-title") as HTMLElement).textContent = t.heading;
    (this.root.querySelector(".sbl3d-intro") as HTMLElement).textContent = t.intro;
    (this.root.querySelector(".sbl3d-privacy") as HTMLElement).textContent = t.privacy;
    (this.root.querySelector(".sbl3d-reload") as HTMLElement).textContent = t.reload;
    this.searchInput.placeholder = t.search;
    this.hint.textContent = t.selectHint;
    this.listen(this.searchInput, "input", () => {
      this.search = this.searchInput.value.trim().toLocaleLowerCase();
      this.renderList();
    });
    this.listen(this.root.querySelector(".sbl3d-reload") as HTMLElement, "click", () => void this.refresh());
    this.mountScene();
    await this.refresh();
  }

  async onClose(): Promise<void> {
    if (this.refreshTimer !== null) window.clearTimeout(this.refreshTimer);
    this.selectionEpoch++;
    for (const remove of this.cleanup.splice(0)) remove();
    if (this.frameId !== null) window.cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.clearGraph();
    this.controls?.dispose();
    this.controls = null;
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.contentEl.removeClass("sbl3d-host");
    this.contentEl.empty();
  }

  scheduleRefresh(): void {
    if (this.refreshTimer !== null) window.clearTimeout(this.refreshTimer);
    this.refreshTimer = window.setTimeout(() => {
      this.refreshTimer = null;
      void this.refresh();
    }, 250);
  }

  private listen(element: HTMLElement, type: string, callback: EventListener): void {
    element.addEventListener(type, callback);
    this.cleanup.push(() => element.removeEventListener(type, callback));
  }

  private mountScene(): void {
    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x090f1c);
      scene.fog = new THREE.FogExp2(0x090f1c, 0.009);
      scene.add(new THREE.AmbientLight(0xffffff, 1.5));
      const light = new THREE.PointLight(0xc3f4ff, 110, 95);
      light.position.set(5, 12, 18);
      scene.add(light);
      const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 400);
      camera.position.set(0, 4, 30);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.stage.appendChild(renderer.domElement);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.07;
      controls.minDistance = 3;
      controls.maxDistance = 140;
      this.scene = scene;
      this.camera = camera;
      this.renderer = renderer;
      this.controls = controls;
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.stage);
      this.resize();
      this.listen(renderer.domElement, "click", (event) => this.selectFromClick(event as MouseEvent));
      const animate = () => {
        controls.update();
        renderer.render(scene, camera);
        this.frameId = window.requestAnimationFrame(animate);
      };
      animate();
    } catch {
      this.hint.textContent = copy[this.plugin.settings.language].webglError;
    }
  }

  private resize(): void {
    if (!this.camera || !this.renderer) return;
    const width = Math.max(1, this.stage.clientWidth);
    const height = Math.max(1, this.stage.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private async refresh(): Promise<void> {
    const files = this.app.vault.getMarkdownFiles();
    this.graph = buildGraph(files, this.app.metadataCache.resolvedLinks, {
      folder: this.plugin.settings.folder,
      maxNotes: this.plugin.settings.maxNotes,
    });
    if (!this.graph.nodes.some((node) => node.id === this.selected)) this.selected = null;
    const t = copy[this.plugin.settings.language];
    (this.root.querySelector(".sbl3d-title") as HTMLElement).textContent = t.heading;
    (this.root.querySelector(".sbl3d-intro") as HTMLElement).textContent = t.intro;
    (this.root.querySelector(".sbl3d-privacy") as HTMLElement).textContent = t.privacy;
    (this.root.querySelector(".sbl3d-reload") as HTMLElement).textContent = t.reload;
    this.searchInput.placeholder = t.search;
    this.hint.textContent = t.selectHint;
    this.count.textContent = `${this.graph.nodes.length} ${t.notes} · ${this.graph.edges.length} ${t.links}`;
    (this.root.querySelector(".sbl3d-stage-count") as HTMLElement).textContent = this.count.textContent;
    this.drawGraph();
    this.renderList();
    await this.renderDetail();
  }

  private clearGraph(): void {
    if (this.mesh) {
      this.scene?.remove(this.mesh);
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
      this.mesh = null;
    }
    if (this.links) {
      this.scene?.remove(this.links);
      this.links.geometry.dispose();
      (this.links.material as THREE.Material).dispose();
      this.links = null;
    }
    this.positions.clear();
  }

  private drawGraph(): void {
    this.clearGraph();
    if (!this.scene || !this.graph.nodes.length) return;
    const groups = [...new Set(this.graph.nodes.map((node) => node.group))].sort();
    const degrees = new Map<string, number>();
    for (const edge of this.graph.edges) {
      degrees.set(edge.source, (degrees.get(edge.source) ?? 0) + 1);
      degrees.set(edge.target, (degrees.get(edge.target) ?? 0) + 1);
    }
    const geometry = new THREE.SphereGeometry(0.28, 12, 10);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff, emissive: 0x294a65, emissiveIntensity: 0.3,
      roughness: 0.35, metalness: 0.1,
    });
    const mesh = new THREE.InstancedMesh(geometry, material, this.graph.nodes.length);
    const object = new THREE.Object3D();
    this.graph.nodes.forEach((node, index) => {
      const groupIndex = groups.indexOf(node.group);
      const position = positionFor(node.id, index, groupIndex, groups.length);
      this.positions.set(node.id, position);
      object.position.copy(position);
      object.scale.setScalar(1 + Math.min(10, degrees.get(node.id) ?? 0) * 0.08);
      object.updateMatrix();
      mesh.setMatrixAt(index, object.matrix);
      mesh.setColorAt(index, colorFor(node.group));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    this.scene.add(mesh);
    this.mesh = mesh;

    const coordinates: number[] = [];
    for (const edge of this.graph.edges) {
      const source = this.positions.get(edge.source);
      const target = this.positions.get(edge.target);
      if (source && target) coordinates.push(...source.toArray(), ...target.toArray());
    }
    const linkGeometry = new THREE.BufferGeometry();
    linkGeometry.setAttribute("position", new THREE.Float32BufferAttribute(coordinates, 3));
    const links = new THREE.LineSegments(
      linkGeometry,
      new THREE.LineBasicMaterial({ color: 0x607c9a, transparent: true, opacity: 0.38 }),
    );
    this.scene.add(links);
    this.links = links;
  }

  private selectFromClick(event: MouseEvent): void {
    if (!this.mesh || !this.camera || !this.renderer) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObject(this.mesh)[0];
    if (hit?.instanceId !== undefined) {
      const node = this.graph.nodes[hit.instanceId];
      if (node) void this.choose(node.id);
    }
  }

  private async choose(id: string): Promise<void> {
    this.selected = id;
    const position = this.positions.get(id);
    if (position && this.camera && this.controls) {
      this.controls.target.copy(position);
      this.camera.position.copy(position.clone().add(new THREE.Vector3(0, 3, 13)));
    }
    this.renderList();
    await this.renderDetail();
  }

  private renderList(): void {
    this.list.replaceChildren();
    const t = copy[this.plugin.settings.language];
    if (!this.graph.nodes.length) {
      this.list.textContent = t.empty;
      return;
    }
    if (this.graph.omitted) {
      const warning = document.createElement("p");
      warning.className = "sbl3d-warning";
      warning.textContent = `${this.graph.omitted} ${t.omitted}`;
      this.list.appendChild(warning);
    }
    const matches = this.graph.nodes.filter((node) =>
      `${node.title} ${node.id}`.toLocaleLowerCase().includes(this.search),
    );
    if (!matches.length) {
      const empty = document.createElement("p");
      empty.textContent = t.noResults;
      this.list.appendChild(empty);
      return;
    }
    for (const node of matches.slice(0, 200)) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `sbl3d-note${node.id === this.selected ? " is-active" : ""}`;
      const dot = document.createElement("span");
      dot.className = "sbl3d-note-dot";
      dot.style.backgroundColor = `#${colorFor(node.group).getHexString()}`;
      const label = document.createElement("span");
      label.textContent = node.title;
      button.append(dot, label);
      button.title = node.id;
      button.addEventListener("click", () => void this.choose(node.id));
      this.list.appendChild(button);
    }
    if (matches.length > 200) {
      const note = document.createElement("p");
      note.className = "sbl3d-warning";
      note.textContent = t.listLimit;
      this.list.appendChild(note);
    }
  }

  private async renderDetail(): Promise<void> {
    const epoch = ++this.selectionEpoch;
    this.detail.replaceChildren();
    const t = copy[this.plugin.settings.language];
    if (!this.selected) {
      const empty = document.createElement("div");
      empty.className = "sbl3d-detail-empty";
      const star = document.createElement("div");
      star.className = "sbl3d-empty-orb";
      star.textContent = "✦";
      const heading = document.createElement("h3");
      heading.textContent = t.select;
      const hint = document.createElement("p");
      hint.textContent = t.selectHint;
      empty.append(star, heading, hint);
      this.detail.appendChild(empty);
      return;
    }
    const node = this.graph.nodes.find((item) => item.id === this.selected);
    const file = node ? this.app.vault.getAbstractFileByPath(node.id) : null;
    if (!(file instanceof TFile) || !node) return;
    const header = document.createElement("div");
    header.className = "sbl3d-detail-head";
    const pill = document.createElement("span");
    pill.className = "sbl3d-group-pill";
    pill.textContent = node.group;
    const title = document.createElement("h3");
    title.textContent = node.title;
    const label = document.createElement("small");
    label.textContent = t.file;
    const path = document.createElement("code");
    path.textContent = node.id;
    const open = document.createElement("button");
    open.type = "button";
    open.className = "sbl3d-open";
    open.textContent = t.open;
    open.addEventListener("click", () => {
      const leaf = this.app.workspace.getLeaf(true);
      void leaf.openFile(file);
    });
    header.append(pill, title, label, path, open);
    const body = document.createElement("div");
    body.className = "sbl3d-note-body";
    this.detail.append(header, body);
    try {
      const markdown = await this.app.vault.cachedRead(file);
      if (epoch !== this.selectionEpoch) return;
      await MarkdownRenderer.render(this.app, markdown, body, file.path, this);
    } catch {
      if (epoch === this.selectionEpoch) body.textContent = t.readError;
    }
  }
}
