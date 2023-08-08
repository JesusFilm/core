import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { discoveryJourneys } from '../data'

import { EmbedJourney } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

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
