import { ReactElement } from 'react'

interface IFrameTestProps {
  journeySlug: string
}

export function IFrameTest({ journeySlug }: IFrameTestProps): ReactElement {
  return <iframe src={`/embed/${journeySlug}`} width="800" height="600" />
}

IFrameTest.getInitialProps = (context): IFrameTestProps => {
  return {
    journeySlug: context.query?.journeySlug
  }
}

export default IFrameTest
