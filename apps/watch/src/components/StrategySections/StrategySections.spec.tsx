import { render, screen } from '@testing-library/react'
import { StrategySections } from './StrategySections'

describe('StrategySections', () => {
  it('should render strategysections', () => {
    render(<StrategySections />)

    expect(screen.getByTestId('StrategySections')).toBeInTheDocument()
  })
})
