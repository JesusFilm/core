import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { styled } from '@mui/material/styles'
import isFunction from 'lodash/isFunction'
import {
  ComponentProps,
  ReactElement,
  ReactNode,
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef
} from 'react'
import { createPortal } from 'react-dom'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'

import { FontFamilies } from '@core/shared/ui/themes'

interface ContentProps {
  children: ReactNode
  document: Document
  fontFamilies?: FontFamilies
}

function Content({
  children,
  document,
  fontFamilies
}: ContentProps): ReactElement {
  const cache = useMemo(() => {
    const defaultFonts = ['Montserrat', 'Open Sans', 'El Messiri']
    const validFonts = getSortedValidFonts([
      ...defaultFonts,
      ...Object.values(fontFamilies ?? {})
    ])

    function getSortedValidFonts(fonts: string[]): string[] {
      return [
        ...new Set(fonts.filter((font) => font !== '' && font !== 'Georgia'))
      ].sort()
    }

    function formatFontName(font: string): string {
      return font.trim().replace(/ /g, '+')
    }

    const fontsParam = validFonts
      .map((font) => `family=${formatFontName(font)}:wght@400;500;600;700;800`)
      .join('&')

    const googleFontsUrl = `https://fonts.googleapis.com/css2?${fontsParam}&display=swap`

    document.head.innerHTML = `${window.document.head.innerHTML}<link href="${googleFontsUrl}" rel="stylesheet" />`

    return createCache({
      key: 'iframe',
      container: document.head,
      prepend: true,
      stylisPlugins: document.dir === 'rtl' ? [prefixer, rtlPlugin] : []
    })
  }, [document, fontFamilies])

  useEffect(() => {
    document.body.style.backgroundColor = 'transparent'
  }, [document])

  return <CacheProvider value={cache}>{children}</CacheProvider>
}

const StyledFrame = styled('iframe')(() => ({
  border: 0
}))

interface FrameProps
  extends Omit<ComponentProps<typeof StyledFrame>, 'children'> {
  children: ((props: { document: Document }) => ReactNode) | ReactNode
  fontFamilies?: FontFamilies
}

export const FramePortal = memo(
  forwardRef<HTMLIFrameElement, FrameProps>(function FramePortal(
    { children, dir, fontFamilies, ...rest },
    ref
  ): ReactElement {
    const frameRef = useRef<HTMLIFrameElement>(null)
    useImperativeHandle(ref, () => frameRef.current as HTMLIFrameElement, [])
    // If we portal content into the iframe before the load event then that
    // content is dropped in firefox.
    const [iframeLoaded, dispatch] = useReducer(() => true, false)
    const document = frameRef.current?.contentDocument
    if (document != null) {
      document.dir = dir ?? ''
    }

    useEffect(() => {
      // When we hydrate the iframe then the load event is already dispatched
      // once the iframe markup is parsed (maybe later but the important part is
      // that it happens before React can attach event listeners).
      // We need to check the readyState of the document once the iframe is
      // mounted and "replay" the missed load event.
      // See https://github.com/facebook/react/pull/13862 for ongoing effort in
      // React (though not with iframes in mind).
      if (
        frameRef?.current?.contentDocument != null &&
        frameRef.current.contentDocument.readyState === 'complete' &&
        !iframeLoaded
      ) {
        dispatch()
      }
    }, [iframeLoaded])

    return (
      <>
        <StyledFrame onLoad={dispatch} ref={frameRef} {...rest} />
        {iframeLoaded &&
          document != null &&
          createPortal(
            <Content document={document} fontFamilies={fontFamilies}>
              {isFunction(children) ? children({ document }) : children}
            </Content>,
            document.body
          )}
      </>
    )
  })
)
