import { createRequire } from 'node:module'

import { CacheProvider } from '@emotion/react'
import styled from '@emotion/styled'
import { render } from '@testing-library/react'

import { createEmotionCache } from '.'

// NES-1728 regression: emotion compiles styles with its own bundled stylis
// (pinned 4.2.0). The prefixer and rtl plugin passed in by createEmotionCache
// come from the workspace's stylis. If those versions diverge (e.g. 4.3.x),
// the 4.3.x prefixer reads `element.siblings` — a field 4.2.0 nodes don't
// have — and crashes with "Cannot read properties of undefined (reading
// 'push')" whenever a bare ::placeholder or :read-only rule compiles in RTL
// mode. In production this took down every RTL-language journey containing a
// text input. The workspace stylis must stay pinned to the version emotion
// ships.
const InputWithPseudoRules = styled('input')({
  paddingLeft: '8px',
  '&::placeholder': {
    opacity: 0.4
  },
  '&:read-only': {
    opacity: 0.6
  }
})

function getInsertedCss(): string {
  return Array.from(document.head.querySelectorAll('style[data-emotion]'))
    .map((style) => style.textContent)
    .join('\n')
}

describe('createEmotionCache', () => {
  afterEach(() => {
    document.head
      .querySelectorAll('style[data-emotion]')
      .forEach((style) => style.remove())
  })

  it('keeps the workspace stylis pinned to the version @emotion/cache bundles', () => {
    const requireModule = createRequire(import.meta.url)
    const workspaceStylisVersion: string = requireModule(
      'stylis/package.json'
    ).version
    const emotionBundledStylisVersion: string = requireModule(
      '@emotion/cache/package.json'
    ).dependencies.stylis

    expect(
      workspaceStylisVersion,
      'The workspace stylis (root package.json) must exactly match the ' +
        'version @emotion/cache depends on. Mixing versions crashes every ' +
        'RTL-language journey (NES-1728). If an @emotion upgrade changed ' +
        'its bundled stylis, re-align the root package.json pin.'
    ).toBe(emotionBundledStylisVersion)
  })

  it('compiles ::placeholder and :read-only rules in RTL mode without crashing', () => {
    const cache = createEmotionCache({ rtl: true })

    expect(() =>
      render(
        <CacheProvider value={cache}>
          <InputWithPseudoRules placeholder="اكتب سؤالك" />
        </CacheProvider>
      )
    ).not.toThrow()

    // stylis-plugin-rtl must have flipped the physical property, proving the
    // rtl pipeline ran rather than being skipped
    expect(getInsertedCss()).toContain('padding-right:8px')
  })

  it('leaves styles unflipped in LTR mode', () => {
    const cache = createEmotionCache({ rtl: false })

    render(
      <CacheProvider value={cache}>
        <InputWithPseudoRules placeholder="type your question" />
      </CacheProvider>
    )

    expect(getInsertedCss()).toContain('padding-left:8px')
  })
})
