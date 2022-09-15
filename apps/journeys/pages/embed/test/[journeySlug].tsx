import { ReactElement, useEffect } from 'react'

interface IFrameTestProps {
  journeySlug: string
}

export function IFrameTest({ journeySlug }: IFrameTestProps): ReactElement {
  // TODO: Remove this check once allow="fullscreen" works with Safari 16+
  useEffect(() => {
    const makeIframeFullscreenOnSafari = (event: MessageEvent): void => {
      if (event.origin === 'http://localhost:4100') {
        const iframe = document.getElementById('jfm-iframe')
        if (iframe != null) {
          if (event.data === true) {
            iframe.style.position = 'fixed'
            iframe.style.zIndex = '999999999999999999999'
          } else {
            iframe.style.position = 'absolute'
            iframe.style.zIndex = 'auto'
          }
        }
      }
    }
    window.addEventListener('message', makeIframeFullscreenOnSafari)
    return () => {
      window.removeEventListener('message', makeIframeFullscreenOnSafari)
    }
  }, [])

  return (
    <div style={{ width: '600px', height: '100%' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '150%',
          overflow: 'hidden',
          backgroundColor: 'transparent'
        }}
      >
        <iframe
          id="jfm-iframe"
          src={`/embed/${journeySlug}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          allowFullScreen
        />
      </div>
    </div>
  )
}

IFrameTest.getInitialProps = (context): IFrameTestProps => {
  return {
    journeySlug: context.query?.journeySlug
  }
}

export default IFrameTest
