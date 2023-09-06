import { ReactElement, useEffect } from 'react'

interface IFrameTestProps {
  journeySlug: string
}

export function IFrameTest({ journeySlug }: IFrameTestProps): ReactElement {
  useEffect(() => {
    const makeIframeFullWindow = (event: MessageEvent): void => {
      // Use this page for basic local testing
      // More accurate testing with stage should use embed script on a webpage.
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
    window.addEventListener('message', makeIframeFullWindow)
    return () => {
      window.removeEventListener('message', makeIframeFullWindow)
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
          allow="fullscreen"
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
