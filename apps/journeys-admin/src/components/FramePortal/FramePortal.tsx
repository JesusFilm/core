import { createPortal } from 'react-dom'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import {
  DetailedHTMLProps,
  IframeHTMLAttributes,
  memo,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useReducer,
  useRef
} from 'react'
import { styled } from '@mui/material'
import { StylesProvider } from '@mui/styles'

interface ContentProps {
  id: string
  children: ReactNode
  document: Document
}

function Content({ children, document }: ContentProps): ReactElement {
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

  return (
    <StylesProvider>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </StylesProvider>
  )
}

const StyledFrame = styled('iframe')(() => ({
  border: 0,
  height: '100%',
  width: '100%'
}))

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
    // We need to check the readyState of the document once the iframe is
    // mounted and "replay" the missed load event.
    // See https://github.com/facebook/react/pull/13862 for ongoing effort in
    // React (though not with iframes in mind).
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
      <StyledFrame onLoad={onLoad} ref={frameRef} {...other} />
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
