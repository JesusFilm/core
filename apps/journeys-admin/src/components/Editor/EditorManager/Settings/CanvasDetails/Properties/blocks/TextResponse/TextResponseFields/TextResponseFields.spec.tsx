import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { TextResponseFields } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TextResponseFields', () => {
  it('should show text response properties', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <JourneyProvider value={{ variant: 'admin' }}>
          <EditorProvider>
            <TextResponseFields />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('textbox', { name: 'Label' })).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Hint' })).toBeInTheDocument()
    expect(getByText('Minimum Size')).toBeInTheDocument()
  })
})
