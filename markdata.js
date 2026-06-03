(function (global) {
  'use strict';

  const DEFAULT_BLOCK_TYPES = {
    heading: { label: 'Heading' },
    paragraph: { label: 'Paragraph' },
    link: { label: 'Link', inline: true },
    image: { label: 'Image', inline: true },
    table: { label: 'Table' },
    formula: { label: 'Formula' },
    flowchart: { label: 'Flowchart' },
    task: { label: 'Task list' },
    code: { label: 'Code block' },
    chart: { label: 'ECharts' },
    music: { label: 'Music score' },
    custom: { label: 'Custom block' }
  };

  const FILE_SOURCE_TYPES = {
    workspace: 'workspace',
    local: 'local',
    git: 'git',
    network: 'network',
    storage: 'storage'
  };

  function createId(prefix) {
    const random = Math.random().toString(36).slice(2, 10);
    return `${prefix || 'node'}-${Date.now().toString(36)}-${random}`;
  }

  class EventBus {
    constructor() {
      this.listeners = new Map();
    }

    on(type, handler) {
      if (!this.listeners.has(type)) this.listeners.set(type, new Set());
      this.listeners.get(type).add(handler);
      return () => this.off(type, handler);
    }

    off(type, handler) {
      const handlers = this.listeners.get(type);
      if (handlers) handlers.delete(handler);
    }

    emit(type, payload) {
      const handlers = this.listeners.get(type);
      if (!handlers) return;
      handlers.forEach((handler) => handler(payload));
    }
  }

  class MarkBlock {
    constructor(type, options = {}) {
      this.id = options.id || createId(type);
      this.type = type || 'paragraph';
      this.level = options.level || 0;
      this.text = options.text || '';
      this.raw = options.raw || '';
      this.attrs = Object.assign({}, options.attrs || {});
      this.children = Array.isArray(options.children) ? options.children : [];
      this.range = options.range || null;
      this.renderer = typeof options.renderer === 'function' ? options.renderer : null;
      this.dom = options.dom || null;
    }

    setRenderer(renderer) {
      this.renderer = typeof renderer === 'function' ? renderer : null;
      return this;
    }

    setDom(dom) {
      this.dom = dom || null;
      return this;
    }

    render(context = {}) {
      if (this.renderer) return this.renderer(this, context);
      return this.dom || null;
    }

    toJSON() {
      return {
        id: this.id,
        type: this.type,
        level: this.level,
        text: this.text,
        raw: this.raw,
        attrs: this.attrs,
        children: this.children.map((child) => (
          child && typeof child.toJSON === 'function' ? child.toJSON() : child
        )),
        range: this.range,
        extensible: {
          renderer: Boolean(this.renderer),
          dom: Boolean(this.dom)
        }
      };
    }
  }

  class MarkDocument extends EventBus {
    constructor(options = {}) {
      super();
      this.id = options.id || createId('document');
      this.title = options.title || 'MarkEasy';
      this.fileName = options.fileName || '';
      this.path = options.path || '';
      this.markdown = options.markdown || '';
      this.version = options.version || 0;
      this.updatedAt = options.updatedAt || new Date().toISOString();
      this.assets = new Map();
      this.meta = Object.assign({}, options.meta || {});
      this.blockTypes = new Map(Object.entries(DEFAULT_BLOCK_TYPES));
      this.blocks = [];
      if (options.blockTypes) {
        Object.keys(options.blockTypes).forEach((key) => {
          this.registerBlockType(Object.assign({ type: key }, options.blockTypes[key]));
        });
      }
      this.reparse();
    }

    setMarkdown(markdown, meta = {}) {
      const next = String(markdown || '');
      const changed = next !== this.markdown;
      this.markdown = next;
      this.version += changed ? 1 : 0;
      this.updatedAt = new Date().toISOString();
      this.meta = Object.assign({}, this.meta, meta);
      if (meta.title) this.title = meta.title;
      if (meta.fileName) this.fileName = meta.fileName;
      if (meta.path) this.path = meta.path;
      this.reparse();
      this.emit('change', this.snapshot());
      this.emit('outline:change', this.getOutline());
      return this;
    }

    getMarkdown() {
      return this.markdown;
    }

    setAsset(path, value) {
      if (!path) return this;
      this.assets.set(String(path), value);
      this.emit('asset', { path: String(path), value });
      return this;
    }

    getAsset(path) {
      return this.assets.get(String(path || ''));
    }

    registerBlockType(definition) {
      if (!definition || !definition.type) {
        throw new Error('Block type definition requires a type.');
      }
      const current = this.blockTypes.get(definition.type) || {};
      this.blockTypes.set(definition.type, Object.assign({}, current, definition));
      return this;
    }

    createBlock(type, options = {}) {
      const definition = this.blockTypes.get(type) || {};
      const block = new MarkBlock(type, Object.assign({
        renderer: definition.renderer,
        dom: definition.dom
      }, options));
      this.emit('block:create', block);
      return block;
    }

    getBlocks(type = '') {
      if (!type) return this.blocks.slice();
      return this.blocks.filter((block) => block.type === type);
    }

    getBlock(id) {
      return this.blocks.find((block) => block.id === id) || null;
    }

    getOutline(options = {}) {
      const minLevel = Number(options.minLevel) || 1;
      const maxLevel = Number(options.maxLevel) || 4;
      return this.blocks
        .filter((block) => block.type === 'heading' && block.level >= minLevel && block.level <= maxLevel)
        .map((block, index) => ({
          id: block.id,
          index,
          level: block.level,
          text: block.text,
          raw: block.raw,
          range: block.range
        }));
    }

    insertBlock(block, index = this.blocks.length) {
      const next = block instanceof MarkBlock
        ? block
        : this.createBlock(block && block.type, block || {});
      const position = Math.max(0, Math.min(Number(index) || 0, this.blocks.length));
      this.blocks.splice(position, 0, next);
      this.version += 1;
      this.updatedAt = new Date().toISOString();
      this.emit('block:insert', { block: next, index: position });
      this.emit('change', this.snapshot());
      this.emit('outline:change', this.getOutline());
      return next;
    }

    updateBlock(id, patch = {}) {
      const block = this.getBlock(id);
      if (!block) return null;
      Object.keys(patch).forEach((key) => {
        if (key === 'attrs') {
          block.attrs = Object.assign({}, block.attrs, patch.attrs || {});
        } else if (key === 'children' && Array.isArray(patch.children)) {
          block.children = patch.children;
        } else if (key in block && !['id', 'type'].includes(key)) {
          block[key] = patch[key];
        }
      });
      this.version += 1;
      this.updatedAt = new Date().toISOString();
      this.emit('block:update', block);
      this.emit('change', this.snapshot());
      if (block.type === 'heading') this.emit('outline:change', this.getOutline());
      return block;
    }

    removeBlock(id) {
      const index = this.blocks.findIndex((block) => block.id === id);
      if (index < 0) return null;
      const [block] = this.blocks.splice(index, 1);
      this.version += 1;
      this.updatedAt = new Date().toISOString();
      this.emit('block:remove', { block, index });
      this.emit('change', this.snapshot());
      if (block.type === 'heading') this.emit('outline:change', this.getOutline());
      return block;
    }

    reparse() {
      this.blocks = parseMarkdown(this.markdown, this);
      return this.blocks;
    }

    snapshot() {
      return {
        id: this.id,
        title: this.title,
        fileName: this.fileName,
        path: this.path,
        markdown: this.markdown,
        version: this.version,
        updatedAt: this.updatedAt,
        meta: Object.assign({}, this.meta),
        blocks: this.blocks.map((block) => block.toJSON())
      };
    }

    applyRemoteSnapshot(snapshot = {}) {
      if (!snapshot || typeof snapshot.markdown !== 'string') return this;
      this.id = snapshot.id || this.id;
      this.title = snapshot.title || this.title;
      this.fileName = snapshot.fileName || this.fileName;
      this.path = snapshot.path || this.path;
      this.version = Number(snapshot.version) || this.version;
      this.setMarkdown(snapshot.markdown, Object.assign({}, snapshot.meta, { source: 'remote' }));
      this.emit('remote:update', this.snapshot());
      return this;
    }

    connect(adapter) {
      if (!adapter || typeof adapter.connect !== 'function') {
        throw new Error('A MarkData adapter must expose connect(document).');
      }
      this.adapter = adapter;
      adapter.connect(this);
      if (typeof adapter.onRemote === 'function') {
        adapter.onRemote((snapshot) => this.applyRemoteSnapshot(snapshot));
      }
      return adapter;
    }

    push() {
      if (this.adapter && typeof this.adapter.send === 'function') {
        this.adapter.send(this.snapshot());
      }
    }
  }

  class MarkDataAdapter extends EventBus {
    connect(documentModel) {
      this.document = documentModel;
      return this;
    }

    send(snapshot) {
      this.emit('send', snapshot);
    }

    onRemote(handler) {
      return this.on('remote', handler);
    }

    receive(snapshot) {
      this.emit('remote', snapshot);
    }
  }

  class DirectoryFileNode {
    constructor(options = {}) {
      this.id = options.id || createId(options.type || 'file');
      this.type = options.type === 'folder' ? 'folder' : 'file';
      this.name = options.name || '';
      this.path = options.path || options.url || '';
      this.url = options.url || '';
      this.source = normalizeFileSource(options.source);
      this.meta = Object.assign({}, options.meta || {});
      this.children = Array.isArray(options.children)
        ? options.children.map((child) => DirectoryFileNode.from(child, this.source))
        : [];
    }

    static from(value, fallbackSource = FILE_SOURCE_TYPES.local) {
      if (value instanceof DirectoryFileNode) return value;
      return new DirectoryFileNode(Object.assign({ source: fallbackSource }, value || {}));
    }

    toJSON() {
      return {
        id: this.id,
        type: this.type,
        name: this.name,
        path: this.path,
        url: this.url,
        source: this.source,
        meta: Object.assign({}, this.meta),
        children: this.children.map((child) => child.toJSON())
      };
    }
  }

  class DirectoryFileModel extends EventBus {
    constructor(options = {}) {
      super();
      this.id = options.id || createId('directory');
      this.source = normalizeFileSource(options.source);
      this.root = options.root ? DirectoryFileNode.from(options.root, this.source) : null;
      this.selectedPath = options.selectedPath || '';
      this.selectedType = options.selectedType || '';
      this.loading = false;
      this.error = null;
      this.adapter = null;
      this.meta = Object.assign({}, options.meta || {});
    }

    setSource(source, meta = {}) {
      this.source = normalizeFileSource(source);
      this.meta = Object.assign({}, this.meta, meta);
      if (this.root) this.root.source = this.source;
      this.emitChange('source:change');
      return this;
    }

    setRoot(root, meta = {}) {
      this.root = root ? DirectoryFileNode.from(root, this.source) : null;
      this.meta = Object.assign({}, this.meta, meta);
      this.error = null;
      this.emitChange('tree:change');
      return this;
    }

    setTree(root, meta = {}) {
      return this.setRoot(root, meta);
    }

    getTree() {
      return this.root;
    }

    select(path, type = '') {
      this.selectedPath = String(path || '');
      const node = this.selectedPath ? this.findNode(this.selectedPath) : null;
      this.selectedType = type || (node && node.type) || '';
      this.emit('selection:change', {
        path: this.selectedPath,
        type: this.selectedType,
        node: node ? node.toJSON() : null
      });
      return node;
    }

    findNode(path, current = this.root) {
      if (!path || !current) return null;
      if (current.path === path || current.url === path) return current;
      for (const child of current.children) {
        const found = this.findNode(path, child);
        if (found) return found;
      }
      return null;
    }

    addNode(parentPath, node) {
      const parent = parentPath ? this.findNode(parentPath) : this.root;
      if (!parent || parent.type !== 'folder') return null;
      const next = DirectoryFileNode.from(node, this.source);
      parent.children.push(next);
      this.emit('node:add', { parent: parent.toJSON(), node: next.toJSON() });
      this.emitChange('tree:change');
      return next;
    }

    updateNode(path, patch = {}) {
      const node = this.findNode(path);
      if (!node) return null;
      Object.keys(patch).forEach((key) => {
        if (key === 'meta') {
          node.meta = Object.assign({}, node.meta, patch.meta || {});
        } else if (key === 'children' && Array.isArray(patch.children)) {
          node.children = patch.children.map((child) => DirectoryFileNode.from(child, node.source));
        } else if (key in node && key !== 'id') {
          node[key] = patch[key];
        }
      });
      this.emit('node:update', node.toJSON());
      this.emitChange('tree:change');
      return node;
    }

    removeNode(path, current = this.root) {
      if (!path || !current || !Array.isArray(current.children)) return null;
      const index = current.children.findIndex((child) => child.path === path || child.url === path);
      if (index >= 0) {
        const [node] = current.children.splice(index, 1);
        if (this.selectedPath === path) this.select('');
        this.emit('node:remove', node.toJSON());
        this.emitChange('tree:change');
        return node;
      }
      for (const child of current.children) {
        const removed = this.removeNode(path, child);
        if (removed) return removed;
      }
      return null;
    }

    query(text = '') {
      const keyword = String(text || '').trim().toLowerCase();
      const result = [];
      walkFileNode(this.root, (node) => {
        if (!keyword || node.name.toLowerCase().includes(keyword) || node.path.toLowerCase().includes(keyword)) {
          result.push(node);
        }
      });
      return result;
    }

    connect(adapter) {
      if (!adapter || typeof adapter.connect !== 'function') {
        throw new Error('A directory adapter must expose connect(directoryModel).');
      }
      this.adapter = adapter;
      adapter.connect(this);
      if (typeof adapter.onRemote === 'function') {
        adapter.onRemote((root) => this.setRoot(root, { source: 'remote' }));
      }
      return adapter;
    }

    async refresh(options = {}) {
      if (!this.adapter || typeof this.adapter.load !== 'function') return this.root;
      this.loading = true;
      this.error = null;
      this.emitChange('loading');
      try {
        const root = await this.adapter.load(options);
        this.setRoot(root, options.meta || {});
        return this.root;
      } catch (error) {
        this.error = error;
        this.emit('error', error);
        this.emitChange('error');
        throw error;
      } finally {
        this.loading = false;
        this.emitChange('loading');
      }
    }

    snapshot() {
      return {
        id: this.id,
        source: this.source,
        selectedPath: this.selectedPath,
        selectedType: this.selectedType,
        loading: this.loading,
        error: this.error ? String(this.error.message || this.error) : null,
        meta: Object.assign({}, this.meta),
        root: this.root ? this.root.toJSON() : null
      };
    }

    emitChange(type = 'change') {
      const snapshot = this.snapshot();
      this.emit(type, snapshot);
      if (type !== 'change') this.emit('change', snapshot);
    }
  }

  class DirectoryFileDataAdapter extends EventBus {
    connect(directoryModel) {
      this.directory = directoryModel;
      return this;
    }

    async load() {
      return this.directory ? this.directory.getTree() : null;
    }

    send(snapshot) {
      this.emit('send', snapshot);
    }

    onRemote(handler) {
      return this.on('remote', handler);
    }

    receive(root) {
      this.emit('remote', root);
    }
  }

  class LocalDirectoryFileAdapter extends DirectoryFileDataAdapter {
    constructor(options = {}) {
      super();
      this.loader = options.loader || options.load || null;
    }

    async load(options = {}) {
      if (typeof this.loader === 'function') return this.loader(options, this.directory);
      return super.load(options);
    }
  }

  class NetworkDirectoryFileAdapter extends DirectoryFileDataAdapter {
    constructor(options = {}) {
      super();
      this.endpoint = options.endpoint || '';
      this.fetchOptions = Object.assign({}, options.fetchOptions || {});
    }

    async load(options = {}) {
      if (!this.endpoint) return super.load(options);
      const request = Object.assign({}, this.fetchOptions, options.fetchOptions || {});
      const response = await global.fetch(this.endpoint, request);
      if (!response.ok) throw new Error(`Network directory load failed: ${response.status}`);
      return response.json();
    }
  }

  class StorageDirectoryFileAdapter extends DirectoryFileDataAdapter {
    constructor(options = {}) {
      super();
      this.storage = options.storage || global.localStorage || null;
      this.storageKey = options.storageKey || 'mark-component-directory';
      this.autoSave = options.autoSave !== false;
      this.unsubscribe = null;
    }

    connect(directoryModel) {
      super.connect(directoryModel);
      if (this.autoSave && directoryModel && typeof directoryModel.on === 'function') {
        this.unsubscribe = directoryModel.on('change', (snapshot) => this.save(snapshot.root));
      }
      return this;
    }

    async load() {
      if (!this.storage) return super.load();
      const raw = this.storage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : null;
    }

    save(root) {
      if (!this.storage) return;
      if (!root) {
        this.storage.removeItem(this.storageKey);
        return;
      }
      this.storage.setItem(this.storageKey, JSON.stringify(root));
    }

    disconnect() {
      if (typeof this.unsubscribe === 'function') this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  const WORKSPACE_SOURCE_OPERATIONS = [
    'list',
    'read',
    'save',
    'createFile',
    'createFolder',
    'rename',
    'delete',
    'move',
    'show',
    'watch'
  ];

  class WorkspaceSourceAdapter extends EventBus {
    constructor(options = {}) {
      super();
      this.type = normalizeFileSource(options.type || FILE_SOURCE_TYPES.local);
      this.id = options.id || createId(this.type);
      this.name = options.name || this.type;
      this.rootPath = options.rootPath || '';
      this.url = options.url || '';
      this.writable = options.writable !== false && (this.type === FILE_SOURCE_TYPES.local || this.type === FILE_SOURCE_TYPES.git);
      this.capabilities = Object.assign({
        list: true,
        read: true,
        save: this.writable,
        createFile: this.writable,
        createFolder: this.writable,
        rename: this.writable,
        delete: this.writable,
        move: this.writable,
        show: this.type !== FILE_SOURCE_TYPES.network,
        watch: this.writable
      }, options.capabilities || {});
      this.meta = Object.assign({}, options.meta || {});
    }

    describe() {
      return {
        id: this.id,
        type: this.type,
        name: this.name,
        rootPath: this.rootPath,
        url: this.url,
        writable: this.writable,
        capabilities: Object.assign({}, this.capabilities),
        meta: Object.assign({}, this.meta)
      };
    }

    assertCapability(operation) {
      if (!this.capabilities[operation]) {
        throw new Error(`Workspace source does not support ${operation}.`);
      }
    }

    async list() {
      this.assertCapability('list');
      throw new Error('WorkspaceSourceAdapter.list must be implemented by the host.');
    }

    async read() {
      this.assertCapability('read');
      throw new Error('WorkspaceSourceAdapter.read must be implemented by the host.');
    }

    async save() {
      this.assertCapability('save');
      throw new Error('WorkspaceSourceAdapter.save must be implemented by the host.');
    }

    async createFile() {
      this.assertCapability('createFile');
      throw new Error('WorkspaceSourceAdapter.createFile must be implemented by the host.');
    }

    async createFolder() {
      this.assertCapability('createFolder');
      throw new Error('WorkspaceSourceAdapter.createFolder must be implemented by the host.');
    }

    async rename() {
      this.assertCapability('rename');
      throw new Error('WorkspaceSourceAdapter.rename must be implemented by the host.');
    }

    async delete() {
      this.assertCapability('delete');
      throw new Error('WorkspaceSourceAdapter.delete must be implemented by the host.');
    }

    async move() {
      this.assertCapability('move');
      throw new Error('WorkspaceSourceAdapter.move must be implemented by the host.');
    }

    async show() {
      this.assertCapability('show');
      throw new Error('WorkspaceSourceAdapter.show must be implemented by the host.');
    }

    watch() {
      this.assertCapability('watch');
      return () => {};
    }
  }

  class WorkspaceSourceRegistry {
    constructor() {
      this.factories = new Map();
    }

    register(type, factory) {
      const sourceType = normalizeFileSource(type);
      if (typeof factory !== 'function') {
        throw new Error('Workspace source factory must be a function.');
      }
      this.factories.set(sourceType, factory);
      return this;
    }

    create(type, options = {}) {
      const sourceType = normalizeFileSource(type);
      const factory = this.factories.get(sourceType);
      if (!factory) {
        return new WorkspaceSourceAdapter(Object.assign({}, options, { type: sourceType }));
      }
      return factory(Object.assign({}, options, { type: sourceType }));
    }

    has(type) {
      return this.factories.has(normalizeFileSource(type));
    }

    types() {
      return Array.from(this.factories.keys());
    }
  }

  function parseMarkdown(markdown, documentModel) {
    const source = String(markdown || '');
    const lines = source.split(/\r?\n/);
    const blocks = [];
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];
      const lineStart = index;

      if (!line.trim()) {
        index += 1;
        continue;
      }

      const custom = parseCustomBlock(lines, index, documentModel);
      if (custom) {
        blocks.push(custom.block);
        index = custom.next;
        continue;
      }

      const fence = line.match(/^\s*```([^\s`]*)\s*$/);
      if (fence) {
        const language = (fence[1] || '').toLowerCase();
        const body = [];
        index += 1;
        while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) {
          body.push(lines[index]);
          index += 1;
        }
        if (index < lines.length) index += 1;
        const raw = lines.slice(lineStart, index).join('\n');
        const type = fencedType(language);
        blocks.push(documentModel.createBlock(type, {
          raw,
          text: body.join('\n'),
          attrs: { language },
          range: { startLine: lineStart + 1, endLine: index }
        }));
        continue;
      }

      if (/^\s*\$\$\s*$/.test(line)) {
        const body = [];
        index += 1;
        while (index < lines.length && !/^\s*\$\$\s*$/.test(lines[index])) {
          body.push(lines[index]);
          index += 1;
        }
        if (index < lines.length) index += 1;
        blocks.push(documentModel.createBlock('formula', {
          raw: lines.slice(lineStart, index).join('\n'),
          text: body.join('\n'),
          attrs: { block: true },
          range: { startLine: lineStart + 1, endLine: index }
        }));
        continue;
      }

      const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (heading) {
        blocks.push(documentModel.createBlock('heading', {
          level: heading[1].length,
          text: heading[2],
          raw: line,
          children: parseInlineObjects(heading[2], documentModel),
          range: { startLine: index + 1, endLine: index + 1 }
        }));
        index += 1;
        continue;
      }

      if (isTableStart(lines, index)) {
        const tableLines = [];
        while (index < lines.length && /\|/.test(lines[index]) && lines[index].trim()) {
          tableLines.push(lines[index]);
          index += 1;
        }
        blocks.push(documentModel.createBlock('table', {
          raw: tableLines.join('\n'),
          text: tableLines.join('\n'),
          attrs: { rows: Math.max(tableLines.length - 1, 0) },
          range: { startLine: lineStart + 1, endLine: index }
        }));
        continue;
      }

      if (/^\s*[-*+]\s+\[[ xX]\]\s+/.test(line)) {
        const taskLines = [];
        while (index < lines.length && /^\s*[-*+]\s+\[[ xX]\]\s+/.test(lines[index])) {
          taskLines.push(lines[index]);
          index += 1;
        }
        blocks.push(documentModel.createBlock('task', {
          raw: taskLines.join('\n'),
          text: taskLines.map((item) => item.replace(/^\s*[-*+]\s+\[[ xX]\]\s+/, '')).join('\n'),
          attrs: {
            items: taskLines.map((item) => ({
              checked: /^\s*[-*+]\s+\[[xX]\]/.test(item),
              text: item.replace(/^\s*[-*+]\s+\[[ xX]\]\s+/, '')
            }))
          },
          range: { startLine: lineStart + 1, endLine: index }
        }));
        continue;
      }

      const paragraph = [line];
      index += 1;
      while (index < lines.length && lines[index].trim() && !startsBlock(lines, index)) {
        paragraph.push(lines[index]);
        index += 1;
      }
      const text = paragraph.join('\n');
      blocks.push(documentModel.createBlock('paragraph', {
        raw: text,
        text,
        children: parseInlineObjects(text, documentModel),
        range: { startLine: lineStart + 1, endLine: index }
      }));
    }

    return blocks;
  }

  function parseCustomBlock(lines, index, documentModel) {
    for (const [type, definition] of documentModel.blockTypes.entries()) {
      if (!definition || type in DEFAULT_BLOCK_TYPES) continue;
      if (typeof definition.parse === 'function') {
        const result = definition.parse(lines, index, documentModel);
        if (result && result.block) return result;
      }
      if (definition.pattern && definition.pattern.test(lines[index])) {
        return {
          block: documentModel.createBlock(type, {
            raw: lines[index],
            text: lines[index],
            range: { startLine: index + 1, endLine: index + 1 }
          }),
          next: index + 1
        };
      }
    }
    return null;
  }

  function parseInlineObjects(text, documentModel) {
    const items = [];
    const pattern = /!\[([^\]]*)\]\(([^)]+)\)|(?<!!)\[([^\]]+)\]\(([^)]+)\)|(\$[^$\n]+\$)/g;
    let match;
    while ((match = pattern.exec(text))) {
      if (match[1] !== undefined) {
        items.push(documentModel.createBlock('image', {
          text: match[1],
          raw: match[0],
          attrs: { alt: match[1], src: match[2] }
        }));
      } else if (match[3] !== undefined) {
        items.push(documentModel.createBlock('link', {
          text: match[3],
          raw: match[0],
          attrs: { href: match[4] }
        }));
      } else if (match[5]) {
        items.push(documentModel.createBlock('formula', {
          text: match[5].slice(1, -1),
          raw: match[5],
          attrs: { block: false }
        }));
      }
    }
    return items;
  }

  function fencedType(language) {
    if (language === 'mermaid') return 'flowchart';
    if (language === 'echarts' || language === 'chart') return 'chart';
    if (language === 'abc' || language === 'staff') return 'music';
    return 'code';
  }

  function startsBlock(lines, index) {
    const line = lines[index] || '';
    return /^\s{0,3}#{1,6}\s+/.test(line)
      || /^\s*```/.test(line)
      || /^\s*\$\$\s*$/.test(line)
      || /^\s*[-*+]\s+\[[ xX]\]\s+/.test(line)
      || isTableStart(lines, index);
  }

  function isTableStart(lines, index) {
    const current = lines[index] || '';
    const next = lines[index + 1] || '';
    return /\|/.test(current) && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(next);
  }

  function normalizeFileSource(source) {
    const value = String(source || '').toLowerCase();
    return FILE_SOURCE_TYPES[value] || FILE_SOURCE_TYPES.local;
  }

  function walkFileNode(node, visitor) {
    if (!node || typeof visitor !== 'function') return;
    visitor(node);
    (node.children || []).forEach((child) => walkFileNode(child, visitor));
  }

  global.MarkData = {
    MarkBlock,
    MarkDocument,
    DocumentDataModel: MarkDocument,
    MarkDataAdapter,
    DirectoryFileNode,
    DirectoryFileModel,
    DirectoryFileDataModel: DirectoryFileModel,
    FileDirectoryDataModel: DirectoryFileModel,
    DirectoryFileDataAdapter,
    LocalDirectoryFileAdapter,
    NetworkDirectoryFileAdapter,
    StorageDirectoryFileAdapter,
    WorkspaceSourceAdapter,
    WorkspaceSourceRegistry,
    workspaceSourceOperations: WORKSPACE_SOURCE_OPERATIONS.slice(),
    parseMarkdown,
    blockTypes: DEFAULT_BLOCK_TYPES,
    fileSources: FILE_SOURCE_TYPES
  };
})(window);
