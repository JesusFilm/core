import { render } from '@testing-library/react'
import { ActionsBanner } from './ActionsBanner'

describe('ActionsBanner', () => {
  it('should render placeholder', () => {
    const { getByText } = render(<ActionsBanner hasActions={false} />)
    expect(
      getByText('Your Journey doesnt have actions yet')
    ).toBeInTheDocument()
  })

  it('should show actions banner', () => {
    const { getByText } = render(<ActionsBanner hasActions />)
    expect(
      getByText('Here you can see the list of goals for this journey')
    ).toBeInTheDocument()
  })
})
