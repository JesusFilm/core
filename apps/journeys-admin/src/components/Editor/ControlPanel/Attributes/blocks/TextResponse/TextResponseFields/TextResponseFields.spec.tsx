import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { TextResponseFields } from '.'

describe('TextResponseFields', () => {
  it('should show text response properties', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <JourneyProvider>
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
