// @vitest-environment node
import { CacheProvider } from '@emotion/react'
import styled from '@emotion/styled'
import { documentGetInitialProps } from '@mui/material-nextjs/v15-pagesRouter'
import type { DocumentContext } from 'next/document'
import { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'

import { createEmotionCache } from '@core/shared/ui/createEmotionCache'

import { createRtlEmotionPlugin } from './rtlEmotionPlugin'

const Padded = styled('div')({ paddingLeft: '8px' })

interface TestAppProps {
  emotionCache?: ReturnType<typeof createEmotionCache>
  pageProps: { campaign?: { language?: { bcp47?: string | null } } }
}

function TestApp({ emotionCache }: TestAppProps): ReactElement {
  return (
    <CacheProvider value={emotionCache ?? createEmotionCache({})}>
      <Padded>content</Padded>
    </CacheProvider>
  )
}

async function renderDocumentStyles(
  pageProps: TestAppProps['pageProps']
): Promise<string> {
  const ctx = {
    defaultGetInitialProps: async (documentCtx: DocumentContext) => ({
      html: (await documentCtx.renderPage()).html
    }),
    renderPage: async ({
      enhanceApp
    }: {
      enhanceApp: (app: typeof TestApp) => (props: TestAppProps) => ReactElement
    }) => {
      const Enhanced = enhanceApp(TestApp)
      return {
        html: renderToString(<Enhanced pageProps={pageProps} />)
      }
    }
  } as unknown as DocumentContext
  const { emotionStyleTags } = await documentGetInitialProps(ctx, {
    emotionCache: createEmotionCache({}),
    plugins: [createRtlEmotionPlugin()]
  })
  return emotionStyleTags
    .filter((tag) => tag != null)
    .map(
      (tag) =>
        (tag.props as { dangerouslySetInnerHTML: { __html: string } })
          .dangerouslySetInnerHTML.__html
    )
    .join('\n')
}

describe('createRtlEmotionPlugin', () => {
  it('serves the server render of an RTL campaign page CSS flipped', async () => {
    const css = await renderDocumentStyles({
      campaign: { language: { bcp47: 'ar' } }
    })

    expect(css).toContain('padding-right:8px')
    expect(css).not.toContain('padding-left:8px')
  })

  it('leaves a left-to-right campaign page on the document cache', async () => {
    const css = await renderDocumentStyles({
      campaign: { language: { bcp47: 'en' } }
    })

    expect(css).toContain('padding-left:8px')
    expect(css).not.toContain('padding-right:8px')
  })
})
