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

// Import the globals.css to ensure Tailwind styles are available
import '../../globals.css'

interface ContentProps {
  children: ReactNode
  document: Document
}

function Content({ children, document }: ContentProps): ReactElement {
  const cache = useMemo(() => {
    // Copy the parent document's head content
    document.head.innerHTML = `${window.document.head.innerHTML}<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&family=Open+Sans&family=El+Messiri:wght@400;600;700&display=swap" rel="stylesheet" />`

    // Ensure all stylesheets from the parent document are properly loaded in the iframe
    Array.from(window.document.styleSheets).forEach((styleSheet) => {
      try {
        if (styleSheet.href) {
          // External stylesheet - create a link element
          const existingLink = document.querySelector(
            `link[href="${styleSheet.href}"]`
          )
          if (!existingLink) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = styleSheet.href
            document.head.appendChild(link)
          }
        } else if (styleSheet.cssRules) {
          // Inline stylesheet - copy the CSS rules
          const cssText = Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n')
          if (cssText.trim()) {
            const style = document.createElement('style')
            style.textContent = cssText
            document.head.appendChild(style)
          }
        }
      } catch (e) {
        // Some stylesheets might not be accessible due to CORS
        console.warn('Could not copy stylesheet:', e)
      }
    })

    return createCache({
      key: 'iframe',
      container: document.head,
      prepend: true,
      stylisPlugins: document.dir === 'rtl' ? [prefixer, rtlPlugin] : []
    })
  }, [document])

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
}

export const FramePortal = memo(
  forwardRef<HTMLIFrameElement, FrameProps>(function FramePortal(
    { children, dir, ...rest },
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
            <Content document={document}>
              {isFunction(children) ? children({ document }) : children}
            </Content>,
            document.body
          )}
      </>
    )
  })
)
