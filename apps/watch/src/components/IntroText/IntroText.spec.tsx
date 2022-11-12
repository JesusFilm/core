import { render } from '@testing-library/react'
import { IntroText } from './IntroText'

describe('IntroText', () => {
  it('should render IntroText', () => {
    const { getByText } = render(<IntroText />)
    expect(getByText('About Our Project'))
  })
})
