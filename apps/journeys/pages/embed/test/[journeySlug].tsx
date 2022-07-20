import { ReactElement } from 'react'

interface IFrameTestProps {
  journeySlug: string
}

export function IFrameTest({ journeySlug }: IFrameTestProps): ReactElement {
  return <iframe src={`/embed/${journeySlug}`} width="800" height="600" />
}

IFrameTest.getInitialProps = (context): IFrameTestProps => {
  console.log('context', context.params)
  return {
    journeySlug: context.params?.journeySlug
  }
}

export default IFrameTest
