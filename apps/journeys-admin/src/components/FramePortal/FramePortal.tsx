import { createPortal } from 'react-dom'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import {
  cloneElement,
  DetailedHTMLProps,
  IframeHTMLAttributes,
  memo,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef
} from 'react'
import { createTheme, ThemeProvider } from '@mui/material'
import { jssPreset, StylesProvider } from '@mui/styles'
import { create } from 'jss'

interface ContentProps {
  id: string
  children: ReactNode
  document: Document
}

function Content({ children, document }: ContentProps): ReactElement {
  const { jss, sheetsManager } = useMemo(() => {
    return {
      jss: create({
        plugins: [...jssPreset().plugins],
        insertionPoint: document.head
      }),
      sheetsManager: new Map()
    }
  }, [document])

  const cache = useMemo(
    () =>
      createCache({
        key: 'iframe',
        container: document.head,
        prepend: true,
        stylisPlugins: []
      }),
    [document]
  )

  const getWindow = useCallback(() => document.defaultView, [document])

  return (
    <StylesProvider jss={jss} sheetsManager={sheetsManager}>
      <CacheProvider value={cache}>
        <ThemeProvider theme={createTheme()}>
          {cloneElement(children, {
            window: getWindow
          })}
          {children}
        </ThemeProvider>
      </CacheProvider>
    </StylesProvider>
  )
}

interface FrameProps
  extends Omit<
    DetailedHTMLProps<
      IframeHTMLAttributes<HTMLIFrameElement>,
      HTMLIFrameElement
    >,
    'css'
  > {
  id: string
  children: ReactNode
}

export function Frame({ id, children, ...other }: FrameProps): ReactElement {
  const frameRef = useRef<HTMLIFrameElement>(null)
  // If we portal content into the iframe before the load event then that content
  // is dropped in firefox.
  const [iframeLoaded, onLoad] = useReducer(() => true, false)
  const document = frameRef.current?.contentDocument

  useEffect(() => {
    // When we hydrate the iframe then the load event is already dispatched
    // once the iframe markup is parsed (maybe later but the important part is
    // that it happens before React can attach event listeners).
    // We need to check the readyState of the document once the iframe is mounted
    // and "replay" the missed load event.
    // See https://github.com/facebook/react/pull/13862 for ongoing effort in React
    // (though not with iframes in mind).
    if (
      frameRef?.current?.contentDocument != null &&
      frameRef.current.contentDocument.readyState === 'complete' &&
      !iframeLoaded
    ) {
      onLoad()
    }
  }, [iframeLoaded])

  return (
    <>
      <iframe onLoad={onLoad} ref={frameRef} {...other} />
      {iframeLoaded &&
        document != null &&
        createPortal(
          <Content id={id} document={document}>
            {children}
          </Content>,
          document.body
        )}
    </>
  )
}

export const FramePortal = memo(Frame)
