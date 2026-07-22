import { renderExplorer } from './explorer'
import type { InsightsDataset } from '../types'

const dataset: InsightsDataset = {
  summary: {
    windowFrom: '2026-05-01T00:00:00.000Z',
    windowTo: '2026-05-31T00:00:00.000Z',
    generatedAt: '2026-06-04T00:00:00.000Z',
    totalSessions: 1,
    totalMessages: 2,
    nullSessionCount: 0,
    singleTurnCount: 1,
    excludedLoadTestTurns: 0,
    suppressedKeywordCount: 2,
    themesAvailable: true,
    translationAvailable: false,
    translatedMessageCount: 0,
    suppressedTranslatedKeywordCount: 0,
    sourceLanguages: []
  },
  facets: [
    { key: 'country:US', label: 'US', kind: 'country', count: 1 },
    { key: 'language:en', label: 'en', kind: 'language', count: 1 },
    {
      key: 'keyword:resurrection',
      label: 'resurrection',
      kind: 'keyword',
      count: 1
    }
  ],
  sessions: [
    {
      id: 's1',
      label: 'Session 001',
      synthetic: false,
      language: 'en',
      languageLabel: 'English',
      translatedLanguages: [],
      ipCountry: 'US',
      messageCount: 2,
      firstUserMessage: 'Hi',
      startTime: '2026-05-10T00:00:00.000Z',
      themes: ['Resurrection'],
      facetKeys: [
        'theme:Resurrection',
        'country:US',
        'language:en',
        'keyword:resurrection'
      ],
      messages: [
        // Hostile content: a literal </script> must not break the page.
        {
          role: 'user',
          text: 'Hi </script><img src=x onerror=alert(1)>',
          startTime: '2026-05-10T00:00:00.000Z',
          model: 'm'
        },
        {
          role: 'assistant',
          text: 'Hello',
          startTime: '2026-05-10T00:00:00.000Z',
          model: 'm'
        }
      ]
    }
  ]
}

// Non-English is the majority case in the real corpus, so the translated
// dataset exercises the common path: a Bengali message, an English-only reply,
// and an RTL Arabic message, plus a translated keyword facet. The Bengali
// strings carry a hostile </script> to prove translation text is still inert.
const bengaliOriginal = 'নমস্কার </script>'
const bengaliEnglish = 'Hello there </script>'
const arabicOriginal = 'السلام عليكم'
const arabicEnglish = 'Peace be upon you'
const bengaliTerm = 'দেবতা'

const translatedDataset: InsightsDataset = {
  summary: {
    windowFrom: '2026-05-01T00:00:00.000Z',
    windowTo: '2026-05-31T00:00:00.000Z',
    generatedAt: '2026-06-04T00:00:00.000Z',
    totalSessions: 1,
    totalMessages: 3,
    nullSessionCount: 0,
    singleTurnCount: 0,
    excludedLoadTestTurns: 0,
    suppressedKeywordCount: 0,
    themesAvailable: true,
    translationAvailable: true,
    translatedMessageCount: 2,
    suppressedTranslatedKeywordCount: 0,
    sourceLanguages: ['bn', 'ar']
  },
  facets: [
    {
      key: 'keyword:' + bengaliTerm,
      label: bengaliTerm,
      kind: 'keyword',
      count: 1,
      labelEnglish: 'god',
      sourceLanguage: 'bn'
    }
  ],
  sessions: [
    {
      id: 't1',
      label: 'Session T',
      synthetic: false,
      language: 'Bengali (Indian)',
      languageLabel: 'Bengali',
      translatedLanguages: ['Bengali', 'Arabic'],
      ipCountry: 'BD',
      messageCount: 3,
      firstUserMessage: bengaliOriginal,
      firstUserMessageEnglish: bengaliEnglish,
      sourceLanguage: 'bn',
      startTime: '2026-05-10T00:00:00.000Z',
      themes: [],
      facetKeys: ['keyword:' + bengaliTerm],
      messages: [
        {
          role: 'user',
          text: bengaliOriginal,
          textEnglish: bengaliEnglish,
          sourceLanguage: 'bn',
          startTime: '2026-05-10T00:00:00.000Z',
          model: 'm'
        },
        {
          role: 'assistant',
          text: 'Peace to you',
          startTime: '2026-05-10T00:00:00.000Z',
          model: 'm'
        },
        {
          role: 'user',
          text: arabicOriginal,
          textEnglish: arabicEnglish,
          sourceLanguage: 'ar',
          startTime: '2026-05-10T00:00:00.000Z',
          model: 'm'
        }
      ]
    }
  ]
}

// A mixed-language session: its journey pill says English, but the messages
// were detected across four languages. The card/detail marker must name them
// and truncate gracefully past three.
const mixedDataset: InsightsDataset = {
  summary: {
    ...translatedDataset.summary,
    sourceLanguages: ['af', 'ar', 'yi', 'ko']
  },
  facets: [],
  sessions: [
    {
      id: 'm1',
      label: 'Session M',
      synthetic: false,
      language: 'en',
      languageLabel: 'English',
      translatedLanguages: ['Afrikaans', 'Arabic', 'Yiddish', 'Korean'],
      ipCountry: 'ZA',
      messageCount: 1,
      firstUserMessage: 'Goeie dag',
      firstUserMessageEnglish: 'Good day',
      sourceLanguage: 'af',
      startTime: '2026-05-10T00:00:00.000Z',
      themes: [],
      facetKeys: [],
      messages: [
        {
          role: 'user',
          text: 'Goeie dag',
          textEnglish: 'Good day',
          sourceLanguage: 'af',
          startTime: '2026-05-10T00:00:00.000Z',
          model: 'm'
        }
      ]
    }
  ]
}

function extractInlinedJson(html: string): string {
  const match = html.match(
    /<script type="application\/json" id="insights-data">\n([\s\S]*?)\n<\/script>/
  )
  if (match == null) throw new Error('inlined dataset script not found')
  return match[1]
}

// --- Minimal DOM shim -------------------------------------------------------
// The vitest env is `node` (no jsdom/happy-dom installed), so to verify the
// viewer's *rendered* output we run its IIFE against this shim and assert on
// the resulting node tree. It supports exactly the API the viewer touches:
// createElement/createTextNode, className/textContent/style/attributes,
// appendChild/removeChild/firstChild, and addEventListener (driven by dispatch).
class FakeNode {
  tagName: string
  id = ''
  className = ''
  style: Record<string, string> = {}
  attributes: Record<string, string> = {}
  children: FakeNode[] = []
  _text: string | null = null
  private handlers: Record<string, Array<() => void>> = {}

  constructor(tag: string) {
    this.tagName = tag
  }

  get firstChild(): FakeNode | null {
    return this.children.length > 0 ? this.children[0] : null
  }

  get textContent(): string {
    if (this._text != null) return this._text
    return this.children.map((child) => child.textContent).join('')
  }

  set textContent(value: string) {
    this._text = value == null ? '' : String(value)
    this.children = []
  }

  get title(): string | undefined {
    return this.attributes.title
  }

  set title(value: string) {
    this.attributes.title = value
  }

  appendChild(child: FakeNode): FakeNode {
    this.children.push(child)
    return child
  }

  removeChild(child: FakeNode): FakeNode {
    const index = this.children.indexOf(child)
    if (index !== -1) this.children.splice(index, 1)
    return child
  }

  setAttribute(name: string, value: string): void {
    this.attributes[name] = value
  }

  getAttribute(name: string): string | undefined {
    return this.attributes[name]
  }

  addEventListener(type: string, handler: () => void): void {
    if (this.handlers[type] == null) this.handlers[type] = []
    this.handlers[type].push(handler)
  }

  dispatch(type: string): void {
    ;(this.handlers[type] ?? []).forEach((handler) => handler())
  }
}

interface FakeDocument {
  registry: Record<string, FakeNode>
  getElementById(id: string): FakeNode | null
  createElement(tag: string): FakeNode
  createTextNode(text: string): FakeNode
}

function createDocument(inlinedJson: string): FakeDocument {
  const registry: Record<string, FakeNode> = {}
  ;['insights-data', 'top', 'facets', 'list', 'detail'].forEach((id) => {
    const node = new FakeNode('div')
    node.id = id
    registry[id] = node
  })
  registry['insights-data']._text = inlinedJson
  return {
    registry,
    getElementById: (id) => registry[id] ?? null,
    createElement: (tag) => new FakeNode(tag),
    createTextNode: (text) => {
      const node = new FakeNode('#text')
      node._text = text == null ? '' : String(text)
      return node
    }
  }
}

function runViewer(ds: InsightsDataset): FakeDocument {
  const html = renderExplorer(ds)
  const json = extractInlinedJson(html)
  const match = html.match(/<script>\n([\s\S]*?)\n<\/script>\n<\/body>/)
  if (match == null) throw new Error('viewer script not found')
  const doc = createDocument(json)
  // The viewer is a self-contained IIFE that reads its data from `document`.
  const run = new Function('document', match[1]) as unknown as (
    d: FakeDocument
  ) => void
  run(doc)
  return doc
}

function collect(node: FakeNode, out: FakeNode[]): FakeNode[] {
  out.push(node)
  node.children.forEach((child) => collect(child, out))
  return out
}

function byClass(root: FakeNode, cls: string): FakeNode[] {
  return collect(root, []).filter(
    (node) => node.className.split(' ').indexOf(cls) !== -1
  )
}

function firstByClass(root: FakeNode, cls: string): FakeNode | null {
  return byClass(root, cls)[0] ?? null
}

function must(node: FakeNode | null | undefined): FakeNode {
  if (node == null) throw new Error('expected a node, found none')
  return node
}

function getHost(doc: FakeDocument, id: string): FakeNode {
  const node = doc.getElementById(id)
  if (node == null) throw new Error('missing host: ' + id)
  return node
}

function openFirstSession(doc: FakeDocument): void {
  const cards = byClass(getHost(doc, 'list'), 'card')
  if (cards.length === 0) throw new Error('no session cards rendered')
  cards[0].dispatch('click')
}

function expandGroup(doc: FakeDocument, title: string): void {
  const groups = byClass(getHost(doc, 'facets'), 'group-title')
  const target = groups.find((group) => group.textContent.indexOf(title) !== -1)
  if (target == null) throw new Error('facet group not found: ' + title)
  target.dispatch('click')
}

describe('renderExplorer', () => {
  it('produces a standalone HTML document with the three panes and viewer', () => {
    const html = renderExplorer(dataset)
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain('id="facets"')
    expect(html).toContain('id="list"')
    expect(html).toContain('id="detail"')
    expect(html).toContain('id="insights-data"')
    // No external references — fully offline (file://-safe).
    expect(html).not.toContain('http://')
    expect(html).not.toContain('https://')
    expect(html).not.toContain('src="')
  })

  it('inlines the dataset so it round-trips through JSON.parse', () => {
    const html = renderExplorer(dataset)
    const parsed = JSON.parse(extractInlinedJson(html))
    expect(parsed).toEqual(dataset)
  })

  it('escapes < so corpus content cannot break out of the JSON script block', () => {
    const html = renderExplorer(dataset)
    // Exactly two real closing script tags (the JSON block + the viewer);
    // the hostile </script> in the corpus is escaped to \\u003c/script>.
    const closes = html.match(/<\/script>/g) ?? []
    expect(closes).toHaveLength(2)
    expect(html).toContain('\\u003c/script>')
    // And the hostile text still round-trips intact for the reader.
    const parsed = JSON.parse(extractInlinedJson(html)) as InsightsDataset
    expect(parsed.sessions[0].messages[0].text).toBe(
      'Hi </script><img src=x onerror=alert(1)>'
    )
  })
})

describe('renderExplorer — bilingual rendering (NES-1762)', () => {
  it('re-themes the viewer onto the JFP token palette', () => {
    const html = renderExplorer(dataset)
    expect(html).toContain('--jfp-red:#EF3340')
    expect(html).toContain('--jfp-navy:#424A66')
    expect(html).toContain('--fg-primary:#4D4D4D')
    // AA-passing red for the active-facet selection state.
    expect(html).toContain('--jfp-red-dark:#643335')
    // Translated English ink is the sanctioned navy accent.
    expect(html).toContain('.t-en-text')
    // The old generic-blue accent is gone.
    expect(html).not.toContain('#2f6feb')
  })

  it('renders a brand eyebrow and keeps red off the disclosure caret', () => {
    const doc = runViewer(dataset)
    const top = getHost(doc, 'top')
    const eyebrow = must(firstByClass(top, 'jfp-eyebrow'))
    expect(eyebrow.textContent).toBe('Jesus Film Project')
    // The caret token moved off brand red so red reads as deliberate emphasis.
    const html = renderExplorer(dataset)
    expect(html).toContain('.caret { display:inline-block')
    expect(html).not.toMatch(/\.caret \{[^}]*--fg-brand/)
  })

  // The tint ramp was removed: the on-system options sat in a luminance band too
  // narrow to line sessions up, and stepping outside it emitted off-palette hues.
  it('renders metadata pills with no colour of their own', () => {
    const doc = runViewer(translatedDataset)
    const pills = byClass(getHost(doc, 'list'), 'pill')
    expect(pills.length).toBeGreaterThan(0)
    pills.forEach((pillNode) => {
      expect(pillNode.className).toBe('pill')
      expect(pillNode.style.backgroundColor).toBeUndefined()
    })
    // Navy means machine translation, and nothing else may borrow it.
    const html = renderExplorer(translatedDataset)
    expect(html).not.toMatch(/\.pill-[a-z] \{[^}]*navy/)
  })

  it('renders the English translation and the untruncated original for a translated message', () => {
    const doc = runViewer(translatedDataset)
    openFirstSession(doc)
    const detail = getHost(doc, 'detail')

    const badge = must(firstByClass(detail, 'b-navy'))
    // Source language spelled out — never a bare 'BN' that reads as "into".
    expect(badge.textContent).toBe('MACHINE-TRANSLATED FROM BENGALI')
    expect(badge.getAttribute('title')).toContain('accuracy is not guaranteed')

    const english = must(firstByClass(detail, 't-en-text'))
    expect(english.textContent).toBe(bengaliEnglish)
    expect(must(firstByClass(detail, 't-en')).getAttribute('dir')).toBe('ltr')

    const original = must(firstByClass(detail, 'o-text'))
    expect(original.textContent).toBe(bengaliOriginal)
    expect(original.getAttribute('dir')).toBe('auto')
  })

  it('renders neither a chip nor a second block for an English-only message', () => {
    const doc = runViewer(dataset)
    openFirstSession(doc)
    const detail = getHost(doc, 'detail')

    expect(firstByClass(detail, 'b-navy')).toBeNull()
    expect(firstByClass(detail, 't-original')).toBeNull()

    // The plain English message passes straight into the bubble, untouched.
    const bubbles = byClass(detail, 'bubble')
    expect(bubbles).toHaveLength(2)
    expect(bubbles[0].textContent).toBe(
      'Hi </script><img src=x onerror=alert(1)>'
    )
    expect(bubbles[1].textContent).toBe('Hello')
  })

  it('keeps a hostile </script> inside textEnglish escaped in the output', () => {
    const html = renderExplorer(translatedDataset)
    const closes = html.match(/<\/script>/g) ?? []
    expect(closes).toHaveLength(2)
    expect(html).toContain('\\u003c/script>')
    const parsed = JSON.parse(extractInlinedJson(html)) as InsightsDataset
    expect(parsed.sessions[0].messages[0].textEnglish).toBe(bengaliEnglish)
  })

  it('sets dir="auto" on an RTL original so Arabic lays out correctly', () => {
    const doc = runViewer(translatedDataset)
    openFirstSession(doc)
    const detail = getHost(doc, 'detail')
    const arabic = byClass(detail, 'o-text').find(
      (node) => node.textContent === arabicOriginal
    )
    expect(must(arabic).getAttribute('dir')).toBe('auto')
  })

  it('shows the English gloss as primary, with a legend and a no-hover marker', () => {
    const doc = runViewer(translatedDataset)
    expandGroup(doc, 'Keywords')
    const facets = getHost(doc, 'facets')

    // A one-line legend decodes the navy treatment without a hover.
    expect(firstByClass(facets, 'facet-legend')).not.toBeNull()

    const gloss = must(firstByClass(facets, 'facet-gloss'))
    expect(gloss.textContent).toBe('god')

    // The glossed facet row carries a visible marker, not only a title hover.
    const row = byClass(facets, 'facet').find(
      (node) => firstByClass(node, 'facet-gloss') != null
    )
    expect(firstByClass(must(row), 'facet-tmark')).not.toBeNull()

    const original = must(firstByClass(facets, 'facet-original'))
    expect(original.textContent).toBe(bengaliTerm)
    expect(original.getAttribute('dir')).toBe('auto')
  })

  it('shows the English preview with an ORIGINAL-cued original beneath it', () => {
    const doc = runViewer(translatedDataset)
    const list = getHost(doc, 'list')

    // No bare language code — the English preview reads as English at a glance.
    const english = must(firstByClass(list, 'preview-en'))
    expect(english.textContent).toBe(bengaliEnglish)
    expect(english.getAttribute('dir')).toBe('ltr')

    const original = must(firstByClass(list, 'preview-original'))
    expect(firstByClass(original, 'o-cue')).not.toBeNull()
    expect(original.textContent).toContain(bengaliOriginal)
    expect(original.getAttribute('dir')).toBe('auto')
  })

  // The navy badge labels only the line beneath it; the session-level fact sits
  // below the preview in a different register; the detail header names them all.
  it('labels the preview line, and states the session fact separately', () => {
    const doc = runViewer(translatedDataset)

    const cardMarker = must(firstByClass(getHost(doc, 'list'), 'card-langs'))
    expect(cardMarker.textContent).toBe('MACHINE-TRANSLATED FROM BENGALI')

    const summary = must(firstByClass(getHost(doc, 'list'), 'card-summary'))
    expect(summary.textContent).toBe(
      'Contains messages machine-translated from Bengali and Arabic'
    )

    openFirstSession(doc)
    const detailMarker = must(
      firstByClass(getHost(doc, 'detail'), 'detail-summary')
    )
    expect(detailMarker.textContent).toBe(
      'Contains messages machine-translated from Bengali and Arabic'
    )
  })

  it('names the single language outright on a card with only one', () => {
    const single: InsightsDataset = {
      ...translatedDataset,
      sessions: [
        { ...translatedDataset.sessions[0], translatedLanguages: ['Bengali'] }
      ]
    }
    const doc = runViewer(single)
    const cardMarker = must(firstByClass(getHost(doc, 'list'), 'card-langs'))
    expect(cardMarker.textContent).toBe('MACHINE-TRANSLATED FROM BENGALI')
  })

  // The marker is a chip: past two languages it must summarise rather than wrap
  // onto a second line and break the pill geometry.
  // In the detail pane there is room to name languages; past two it summarises
  // the tail rather than wrapping the chip onto a second line.
  it('truncates the detail-header language list past two languages', () => {
    const doc = runViewer(mixedDataset)
    openFirstSession(doc)
    const marker = must(firstByClass(getHost(doc, 'detail'), 'detail-summary'))
    expect(marker.textContent).toContain(
      'Afrikaans, Arabic, Yiddish and Korean'
    )

    // The narrow card never wraps or clips: it states the count instead.
    const cardMarker = must(firstByClass(getHost(doc, 'list'), 'card-langs'))
    expect(cardMarker.textContent).toBe('MACHINE-TRANSLATED FROM AFRIKAANS')
  })

  it('discloses machine translation in the header with named languages and a legend', () => {
    const doc = runViewer(translatedDataset)
    const top = getHost(doc, 'top')

    const note = must(firstByClass(top, 'note-translation'))
    expect(note.textContent).toContain('2 messages')
    // Source languages are named, not shown as bare codes.
    expect(note.textContent).toContain('Bengali, Arabic')
    expect(note.textContent).not.toContain('bn, ar')
    expect(note.textContent.toLowerCase()).toContain(
      'accuracy is not guaranteed'
    )
    // Reworded so it no longer overclaims that previews show the full original.
    expect(note.textContent.toLowerCase()).toContain(
      'in full in the conversation view'
    )

    // The legend sets each label in the very ink it names, so it demonstrates the
    // code rather than asserting it. Two 10px swatches read as one colour.
    const translatedSample = must(firstByClass(top, 'ink-translated-text'))
    const originalSample = must(firstByClass(top, 'ink-original-text'))
    expect(translatedSample.textContent).toBe('English (machine translation)')
    expect(originalSample.textContent).toBe('Original message')
    expect(firstByClass(top, 'swatch')).toBeNull()
  })
})

describe('renderExplorer — the navy badge never brands human text (NES-1762)', () => {
  // A card whose first message is human English, but whose later messages were
  // translated. The navy badge must NOT sit above that human English line.
  const englishPreviewMixed: InsightsDataset = {
    ...translatedDataset,
    sessions: [
      {
        ...translatedDataset.sessions[0],
        firstUserMessage: 'is the bible reliable?',
        firstUserMessageEnglish: undefined,
        sourceLanguage: undefined,
        translatedLanguages: ['Afrikaans', 'Korean']
      }
    ]
  }

  it('omits the navy badge when the preview line is human English', () => {
    const doc = runViewer(englishPreviewMixed)
    const list = getHost(doc, 'list')
    expect(firstByClass(list, 'card-langs')).toBeNull()
    expect(firstByClass(list, 'preview-en')).toBeNull()
    // ...but the session still discloses that it contains translations.
    const summary = must(firstByClass(list, 'card-summary'))
    expect(summary.textContent).toBe(
      'Contains messages machine-translated from Afrikaans and Korean'
    )
  })

  it('omits the redundant summary when the preview badge already says it', () => {
    const single: InsightsDataset = {
      ...translatedDataset,
      sessions: [
        { ...translatedDataset.sessions[0], translatedLanguages: ['bn'] }
      ]
    }
    const doc = runViewer(single)
    const list = getHost(doc, 'list')
    expect(must(firstByClass(list, 'card-langs')).textContent).toBe(
      'MACHINE-TRANSLATED FROM BENGALI'
    )
    expect(firstByClass(list, 'card-summary')).toBeNull()
  })
})

describe('renderExplorer — RTL originals (NES-1762)', () => {
  // dir="auto" resolves from the first strong character. The Latin word
  // "Original" is that character, so the wrapper must not rely on auto alone.
  it('pins the original wrapper rtl for an RTL language and excludes the label', () => {
    const doc = runViewer(translatedDataset)
    openFirstSession(doc)
    const detail = getHost(doc, 'detail')
    const originals = byClass(detail, 't-original')
    // The Arabic message is the third; the Bengali (LTR) is the first.
    const arabic = originals.find((node) =>
      node.textContent.includes('السلام عليكم')
    )
    expect(arabic).toBeDefined()
    expect(must(arabic).getAttribute('dir')).toBe('rtl')
    const bengali = originals.find((node) =>
      node.textContent.includes('নমস্কার')
    )
    expect(must(bengali).getAttribute('dir')).toBe('auto')

    // The label carries its own dir, so it never decides the wrapper's.
    const label = must(firstByClass(must(arabic), 'o-label'))
    expect(label.getAttribute('dir')).toBe('ltr')
  })
})

function byTag(root: FakeNode, tag: string): FakeNode[] {
  return collect(root, []).filter((node) => node.tagName === tag)
}

// The chat corpus is markdown. The viewer renders a deliberately tiny subset —
// small headings, bold, unordered lists, blockquotes, paragraphs — hand-rolled
// through createElement/textContent so hostile content can never become markup.
const assistantMarkdown = [
  '# Assurance',
  '',
  'Two things matter:',
  '',
  '- **Grace** is a gift',
  '- Faith follows',
  '',
  '> Peace I leave with you',
  '',
  'Read </script> as text.'
].join('\n')

const markdownDataset: InsightsDataset = {
  summary: { ...dataset.summary, translationAvailable: false },
  facets: [],
  sessions: [
    {
      id: 'md1',
      label: 'Session MD',
      synthetic: false,
      language: 'en',
      languageLabel: 'English',
      translatedLanguages: [],
      ipCountry: 'US',
      messageCount: 2,
      firstUserMessage: 'tell me about grace',
      startTime: '2026-05-10T00:00:00.000Z',
      themes: [],
      facetKeys: [],
      messages: [
        {
          role: 'user',
          text: 'tell me about grace',
          startTime: '2026-05-10T00:00:00.000Z',
          model: 'm'
        },
        {
          role: 'assistant',
          text: assistantMarkdown,
          startTime: '2026-05-10T00:00:00.000Z',
          model: 'm'
        }
      ]
    }
  ]
}

// A translated message whose English gloss AND original are both markdown, in an
// RTL language — the parser must run over both blocks and the original must
// still flip to rtl.
const enGloss = '## Answer\n\n- **love** first'
const arGloss = '## عنوان\n\n- **الله**'
const markdownTranslatedDataset: InsightsDataset = {
  ...translatedDataset,
  sessions: [
    {
      ...translatedDataset.sessions[0],
      firstUserMessage: arGloss,
      firstUserMessageEnglish: enGloss,
      sourceLanguage: 'ar',
      translatedLanguages: ['Arabic'],
      messageCount: 1,
      messages: [
        {
          role: 'user',
          text: arGloss,
          textEnglish: enGloss,
          sourceLanguage: 'ar',
          startTime: '2026-05-10T00:00:00.000Z',
          model: 'm'
        }
      ]
    }
  ]
}

describe('renderExplorer — minimal Markdown rendering (NES-1762)', () => {
  it('renders headings, bold, lists, and blockquotes as structure', () => {
    const doc = runViewer(markdownDataset)
    openFirstSession(doc)
    const detail = getHost(doc, 'detail')

    // An in-bubble '#' becomes a small md-h1, never raw '# Assurance' text.
    expect(must(firstByClass(detail, 'md-h1')).textContent).toBe('Assurance')

    // '**Grace**' becomes a <strong>, not literal asterisks.
    expect(byTag(detail, 'strong').map((node) => node.textContent)).toContain(
      'Grace'
    )

    // Two '- ' lines become one md-ul with two md-li.
    const list = must(firstByClass(detail, 'md-ul'))
    const items = byClass(list, 'md-li')
    expect(items).toHaveLength(2)
    expect(items[1].textContent).toBe('Faith follows')

    // Blockquote and paragraph.
    expect(must(firstByClass(detail, 'md-quote')).textContent).toBe(
      'Peace I leave with you'
    )
    expect(firstByClass(detail, 'md-p')).not.toBeNull()
  })

  it('never creates markup elements from hostile inline content', () => {
    const doc = runViewer(markdownDataset)
    openFirstSession(doc)
    const detail = getHost(doc, 'detail')
    // The '</script>' the assistant "wrote" is text, not a tag: no script/img
    // node exists anywhere in the tree, and the literal survives intact.
    expect(byTag(detail, 'script')).toHaveLength(0)
    expect(byTag(detail, 'img')).toHaveLength(0)
    expect(byClass(detail, 'md-p').map((node) => node.textContent)).toContain(
      'Read </script> as text.'
    )
  })

  it('treats both - and * as bullets, but not **bold** starting a line', () => {
    const ds: InsightsDataset = {
      ...markdownDataset,
      sessions: [
        {
          ...markdownDataset.sessions[0],
          messageCount: 1,
          messages: [
            {
              role: 'assistant',
              text: '**Heading bold** intro\n\n* **A:** first\n* second',
              startTime: '2026-05-10T00:00:00.000Z',
              model: 'm'
            }
          ]
        }
      ]
    }
    const doc = runViewer(ds)
    openFirstSession(doc)
    const detail = getHost(doc, 'detail')

    // '* ' lines form a real list — the marker the LLM most often emits.
    const items = byClass(detail, 'md-li')
    expect(items).toHaveLength(2)
    expect(items[0].textContent).toBe('A: first')
    expect(items[1].textContent).toBe('second')

    // ...but a line that only starts with '**bold**' is a paragraph, not a bullet.
    const para = must(firstByClass(detail, 'md-p'))
    expect(para.textContent).toBe('Heading bold intro')
    expect(byTag(para, 'strong').map((node) => node.textContent)).toContain(
      'Heading bold'
    )
  })

  it('leaves an unmatched ** as literal text', () => {
    const ds: InsightsDataset = {
      ...markdownDataset,
      sessions: [
        {
          ...markdownDataset.sessions[0],
          messageCount: 1,
          messages: [
            {
              role: 'assistant',
              text: 'a ** dangling marker',
              startTime: '2026-05-10T00:00:00.000Z',
              model: 'm'
            }
          ]
        }
      ]
    }
    const doc = runViewer(ds)
    openFirstSession(doc)
    const detail = getHost(doc, 'detail')
    expect(byTag(detail, 'strong')).toHaveLength(0)
    expect(must(firstByClass(detail, 'md-p')).textContent).toBe(
      'a ** dangling marker'
    )
  })

  it('renders markdown in BOTH the translated English and the original', () => {
    const doc = runViewer(markdownTranslatedDataset)
    openFirstSession(doc)
    const detail = getHost(doc, 'detail')

    const enText = must(firstByClass(detail, 't-en-text'))
    expect(firstByClass(enText, 'md-h2')).not.toBeNull()
    expect(byTag(enText, 'strong').map((node) => node.textContent)).toContain(
      'love'
    )

    const oText = must(firstByClass(detail, 'o-text'))
    expect(firstByClass(oText, 'md-h2')).not.toBeNull()
    expect(byTag(oText, 'strong').map((node) => node.textContent)).toContain(
      'الله'
    )
    // Markdown blocks don't defeat the RTL wrapper.
    expect(must(firstByClass(detail, 't-original')).getAttribute('dir')).toBe(
      'rtl'
    )
  })
})

describe('renderExplorer — collapsed original (NES-1762)', () => {
  it('collapses the original by default and expands it on click', () => {
    const doc = runViewer(translatedDataset)
    openFirstSession(doc)
    const detail = getHost(doc, 'detail')

    // Collapsed by default — the navy English gloss is the visible reading path.
    const panel = must(firstByClass(detail, 't-original'))
    expect(panel.style.display).toBe('none')

    const toggle = must(firstByClass(detail, 'o-toggle'))
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(toggle.textContent).toContain('Show original')

    toggle.dispatch('click')
    expect(panel.style.display).toBe('block')
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(toggle.textContent).toContain('Hide original')

    // ...and it collapses again on a second click.
    toggle.dispatch('click')
    expect(panel.style.display).toBe('none')
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })

  it('keeps the machine-translation disclosure visible while collapsed', () => {
    const doc = runViewer(translatedDataset)
    openFirstSession(doc)
    const detail = getHost(doc, 'detail')

    // The panel is still collapsed; the disclosure must read without expanding.
    expect(must(firstByClass(detail, 't-original')).style.display).toBe('none')
    expect(
      must(firstByClass(detail, 'o-note')).textContent.toLowerCase()
    ).toContain('accuracy not guaranteed')
    // The badge above still names machine translation and the source language.
    expect(must(firstByClass(detail, 'b-navy')).textContent).toBe(
      'MACHINE-TRANSLATED FROM BENGALI'
    )
  })
})
