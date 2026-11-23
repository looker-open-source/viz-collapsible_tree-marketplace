// © 2019 Google LLC.  All rights reserved.
//
// This software is subject to the Google Cloud Terms of Service, as
// modified by the "General Software Terms" of the Google Cloud Service Specific Terms, available at: https://cloud.google.com/terms/service-terms.

import {expect, describe, test, jest, beforeEach, afterEach} from '@jest/globals';

class FakeTextNode {
  nodeType = 3;
  parentNode: FakeElement | null = null;
  data: string;

  constructor(text: string) {
    this.data = text;
  }

  get textContent(): string {
    return this.data;
  }

  set textContent(val: string) {
    this.data = String(val);
  }
}

class FakeElement {
  nodeType = 1;
  tagName: string;
  nodeName: string;
  namespaceURI: string;
  ownerDocument: FakeDocument;
  parentNode: FakeElement | null = null;
  childNodes: Array<FakeElement | FakeTextNode> = [];
  attributes: Map<string, string> = new Map();
  listeners: Map<string, Array<(ev?: any) => void>> = new Map();
  styleStore: Map<string, string> = new Map();
  clientWidth = 800;
  clientHeight = 600;
  __data__?: any;
  transform = {
    baseVal: {
      consolidate: () => null,
    },
  };

  style = {
    setProperty: (name: string, value: string) => {
      this.styleStore.set(name, String(value));
    },
    removeProperty: (name: string) => {
      this.styleStore.delete(name);
    },
    getPropertyValue: (name: string) => this.styleStore.get(name) ?? '',
  };

  constructor(doc: FakeDocument, tagName: string, namespaceURI: string) {
    this.ownerDocument = doc;
    this.tagName = tagName;
    this.nodeName = tagName;
    this.namespaceURI = namespaceURI;
  }

  get children(): FakeElement[] {
    return this.childNodes.filter(
      (n): n is FakeElement => n instanceof FakeElement
    );
  }

  get textContent(): string {
    return this.childNodes.map(n => n.textContent).join('');
  }

  set textContent(val: string) {
    this.childNodes = [];
    const str = String(val);
    if (str.length > 0) {
      const tn = new FakeTextNode(str);
      tn.parentNode = this;
      this.childNodes.push(tn);
    }
  }

  get innerHTML(): string {
    throw new Error('innerHTML getter should not be needed');
  }

  set innerHTML(_val: string) {
    this.ownerDocument.innerHTMLAssignments.push(_val);
    throw new Error('Unsafe innerHTML assignment (.html() sink) detected');
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, String(value));
  }

  setAttributeNS(_ns: string, name: string, value: string) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
  }

  appendChild<T extends FakeElement | FakeTextNode>(child: T): T {
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }
    child.parentNode = this;
    this.childNodes.push(child);
    return child;
  }

  insertBefore<T extends FakeElement | FakeTextNode>(
    child: T,
    ref: FakeElement | FakeTextNode | null
  ): T {
    if (!ref) {
      return this.appendChild(child);
    }
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }
    const idx = this.childNodes.indexOf(ref);
    child.parentNode = this;
    if (idx === -1) {
      this.childNodes.push(child);
    } else {
      this.childNodes.splice(idx, 0, child);
    }
    return child;
  }

  removeChild<T extends FakeElement | FakeTextNode>(child: T): T {
    const idx = this.childNodes.indexOf(child);
    if (idx !== -1) {
      this.childNodes.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  addEventListener(type: string, listener: (ev?: any) => void) {
    const list = this.listeners.get(type) ?? [];
    list.push(listener);
    this.listeners.set(type, list);
  }

  removeEventListener(type: string, listener: (ev?: any) => void) {
    const list = this.listeners.get(type);
    if (!list) return;
    this.listeners.set(
      type,
      list.filter(fn => fn !== listener)
    );
  }

  dispatchClick(event: any = {type: 'click'}) {
    const list = this.listeners.get('click') ?? [];
    list.forEach(fn => fn.call(this, event));
  }

  matchesSelector(selector: string): boolean {
    if (selector === '*') return true;
    const [tag, cls] = selector.split('.');
    if (tag && this.tagName.toLowerCase() !== tag.toLowerCase()) {
      return false;
    }
    if (cls) {
      const classes = (this.getAttribute('class') ?? '').split(/\s+/);
      if (!classes.includes(cls)) return false;
    }
    return true;
  }

  querySelectorAll(selector: string): FakeElement[] {
    const results: FakeElement[] = [];
    const walk = (el: FakeElement) => {
      for (const child of el.children) {
        if (child.matchesSelector(selector)) {
          results.push(child);
        }
        walk(child);
      }
    };
    walk(this);
    return results;
  }

  querySelector(selector: string): FakeElement | null {
    return this.querySelectorAll(selector)[0] ?? null;
  }
}

class FakeDocument {
  innerHTMLAssignments: string[] = [];
  documentElement: FakeElement;
  defaultView = {
    getComputedStyle: (el: FakeElement) => ({
      getPropertyValue: (prop: string) => el.style.getPropertyValue(prop),
    }),
  };

  constructor() {
    this.documentElement = new FakeElement(
      this,
      'html',
      'http://www.w3.org/1999/xhtml'
    );
  }

  createElement(tagName: string): FakeElement {
    return new FakeElement(this, tagName, 'http://www.w3.org/1999/xhtml');
  }

  createElementNS(ns: string, tagName: string): FakeElement {
    return new FakeElement(this, tagName, ns);
  }
}

describe('collapsible_tree node label rendering', () => {
  let registeredVis: any;
  let openDrillMenuMock: ReturnType<typeof jest.fn>;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    openDrillMenuMock = jest.fn();
    (global as any).looker = {
      plugins: {
        visualizations: {
          add: (v: any) => {
            registeredVis = v;
          },
        },
      },
    };
    (global as any).LookerCharts = {
      Utils: {
        openDrillMenu: openDrillMenuMock,
        openUrl: jest.fn(),
      },
    };
    require('./collapsible_tree');
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    delete (global as any).document;
  });

  test('renders markup characters in labels as plain text + <title> without invoking innerHTML or breaking drill clicks', () => {
    const doc = new FakeDocument();
    (global as any).document = doc;
    const container = doc.createElement('div');
    const doneRendering = jest.fn();

    const visInstance = {
      ...registeredVis,
      addError: jest.fn(),
      clearErrors: jest.fn(),
    };

    visInstance.create(container, {});

    const markupLabel = '</title><b>x</b> & <i>y</i>';
    const leafLabel = '<span>leaf & detail</span>';
    const nodeLinks = [
      {label: 'Drill Node', type: 'url', type_label: 'URL', url: '#drill'},
    ];

    const data = [
      {
        'dim.a': {value: markupLabel, links: nodeLinks},
        'dim.b': {value: leafLabel, links: []},
      },
    ];
    const queryResponse = {
      fields: {
        pivots: [],
        dimensions: [{name: 'dim.a'}, {name: 'dim.b'}],
        dimension_like: [{name: 'dim.a'}, {name: 'dim.b'}],
        measure_like: [],
      },
    };

    visInstance.updateAsync(
      data,
      container,
      {},
      queryResponse,
      {},
      doneRendering
    );

    // Zero innerHTML / .html() calls anywhere during initial render
    expect(doc.innerHTMLAssignments).toHaveLength(0);
    expect(container.querySelectorAll('b')).toHaveLength(0);
    expect(container.querySelectorAll('i')).toHaveLength(0);
    expect(container.querySelectorAll('span')).toHaveLength(0);

    // Root + depth-1 node rendered initially (depth-2 collapsed)
    const initialTexts = container.querySelectorAll('text');
    expect(initialTexts).toHaveLength(2);

    const labelTextEl = initialTexts[1];
    // Direct Text child holds ellipsized plain text, child <title> holds full raw label
    const directTextNodes = labelTextEl.childNodes.filter(
      n => n instanceof FakeTextNode
    );
    expect(directTextNodes).toHaveLength(1);
    expect(directTextNodes[0].textContent).toContain('</title><b>x</b>');

    const titleEls = labelTextEl.querySelectorAll('title');
    expect(titleEls).toHaveLength(1);
    expect(titleEls[0].textContent).toBe(markupLabel);
    expect(titleEls[0].children).toHaveLength(0);

    // Verify click handler is attached to <text> (NOT <title>) and triggers openDrillMenu
    expect(titleEls[0].listeners.get('click') ?? []).toHaveLength(0);
    labelTextEl.dispatchClick();
    expect(openDrillMenuMock).toHaveBeenCalledTimes(1);
    expect(openDrillMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({links: nodeLinks})
    );

    // Click parent circle to expand depth-2 leaf node containing leafLabel
    const circles = container.querySelectorAll('circle.node');
    expect(circles).toHaveLength(2);
    circles[1].dispatchClick();

    expect(doc.innerHTMLAssignments).toHaveLength(0);
    const expandedTexts = container.querySelectorAll('text');
    expect(expandedTexts).toHaveLength(3);
    const leafTitle = expandedTexts[2].querySelector('title');
    expect(leafTitle?.textContent).toBe(leafLabel);
    expect(container.querySelectorAll('span')).toHaveLength(0);

    // Re-rendering clears previous SVG cleanly without .html('')
    visInstance.updateAsync(
      data,
      container,
      {},
      queryResponse,
      {},
      doneRendering
    );
    expect(doc.innerHTMLAssignments).toHaveLength(0);
    expect(container.querySelectorAll('svg')).toHaveLength(1);

    jest.advanceTimersByTime(1000);
    expect(doneRendering).toHaveBeenCalled();
  });
});
