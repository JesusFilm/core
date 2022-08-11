import { ReactElement } from 'react'

interface IFrameTestProps {
  journeySlug: string
}

export function IFrameTest({ journeySlug }: IFrameTestProps): ReactElement {
  return (
    <div
      style={{
        position: 'relative',
        width: 356,
        height: 546,
        overflow: 'hidden'
      }}
      id="jfm-iframe-container"
    >
      <iframe
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
  )
}

IFrameTest.getInitialProps = (context): IFrameTestProps => {
  return {
    journeySlug: context.query?.journeySlug
  }
}

export default IFrameTest
