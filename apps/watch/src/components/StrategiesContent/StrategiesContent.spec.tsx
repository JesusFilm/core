import { render, screen } from '@testing-library/react'
import { StrategiesContent } from './StrategiesContent'

describe('StrategiesContent', () => {
  it('should render strategiescontent', () => {
    render(<StrategiesContent />)

    expect(screen.getByTestId('StrategiesContentStack')).toBeInTheDocument()
  })
})
