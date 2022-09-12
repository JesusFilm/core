import { ReactElement } from 'react'

interface IFrameTestProps {
  journeySlug: string
}

export function IFrameTest({ journeySlug }: IFrameTestProps): ReactElement {
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
