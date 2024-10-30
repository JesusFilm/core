import Button from '@mui/material/Button'
import { fireEvent, render } from '@testing-library/react'
import { ReactElement } from 'react'

import { journey } from './JourneyProvider.data'

import { JourneyProvider, useJourney } from '.'

const checkJourney = jest.fn()

const TestComponent = (): ReactElement => {
  const { journey } = useJourney()

  return <Button onClick={checkJourney(journey)}>Test</Button>
}

describe('JourneyContext', () => {
  it('should pass through the journey props', () => {
    const { getByRole } = render(
      <JourneyProvider value={{ journey }}>
        <TestComponent />
      </JourneyProvider>
    )

    fireEvent.click(getByRole('button'))

    expect(checkJourney).toHaveBeenCalledWith(journey)
  })
})
