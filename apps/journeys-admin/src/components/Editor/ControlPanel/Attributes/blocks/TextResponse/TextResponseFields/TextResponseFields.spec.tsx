import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { render } from '@testing-library/react'
import { TextResponseFields } from '.'

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
