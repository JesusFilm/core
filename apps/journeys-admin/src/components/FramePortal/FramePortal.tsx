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
import { styled } from '@mui/material/styles'

interface ContentProps {
  children: ReactNode
  document: Document
}

function Content({ children, document }: ContentProps): ReactElement {
  const cache = useMemo(
    () =>
      createCache({
        key: 'iframe',
        container: document.head,
        prepend: true
      }),
    [document]
  )

  useEffect(() => {
    document.body.style.backgroundColor = 'transparent'
    document.head.innerHTML =
      document.head.innerHTML +
      '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&family=Open+Sans&display=swap" rel="stylesheet" />'
  }, [document])

  return <CacheProvider value={cache}>{children}</CacheProvider>
}

const StyledFrame = styled('iframe')(() => ({
  border: 0
}))

interface FrameProps
  extends Omit<
    DetailedHTMLProps<
      IframeHTMLAttributes<HTMLIFrameElement>,
      HTMLIFrameElement
    >,
    'css'
  > {
  children: ReactNode
}

export const FramePortal = memo(function FramePortal({
  children,
  ...rest
}: FrameProps): ReactElement {
  const frameRef = useRef<HTMLIFrameElement>(null)
  // If we portal content into the iframe before the load event then that
  // content is dropped in firefox.
  const [iframeLoaded, dispatch] = useReducer(() => true, false)
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
      dispatch()
    }
  }, [iframeLoaded])

  return (
    <>
      <StyledFrame onLoad={dispatch} ref={frameRef} {...rest} />
      {iframeLoaded &&
        document != null &&
        createPortal(
          <Content document={document}>{children}</Content>,
          document.body
        )}
    </>
  )
})
