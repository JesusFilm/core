import { fireEvent, render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { discoveryJourneys } from '../data'
import { EmbedJourney } from '.'

describe('EmbedJourney', () => {
  it('should handle click for embed journey', () => {
    window.open = jest.fn()
    const { getByLabelText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EmbedJourney
            slug="admin-center"
            discoveryJourney={discoveryJourneys[1]}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByLabelText('admin-center-embedded'))
    expect(window.open).toHaveBeenCalledWith(
      'https://your.nextstep.is/admin-center'
    )
  })
})
