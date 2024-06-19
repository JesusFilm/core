import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '../../../../libs/JourneyProvider'
import { journey } from '../../TemplateFooter/data'

import { TemplateEditButton } from './TemplateEditButton'

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
