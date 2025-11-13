import { render } from '@testing-library/react'
import { ContainerDescription } from './ContainerDescription'

describe('ContainerDescription', () => {
  const sampleText = 'This text should appear in the description'

  it('should render description text correctly', () => {
    const { getByText } = render(
      <ContainerDescription value={sampleText} />
    )
    expect(getByText(sampleText)).toBeInTheDocument()
  })
})
