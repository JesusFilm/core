import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journey } from '../../../Editor/ActionDetails/data'

import { TemplateEditButton } from './TemplateEditButton'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('TemplateEditButton', () => {
  it('shoul render edit button with correct link', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <TemplateEditButton journeyId="journeyId" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('link')).toHaveAttribute('href', '/publisher/journeyId')
  })
})
