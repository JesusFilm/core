import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'

import { SinglePageEditor } from './SinglePageEditor'

jest.mock('../Slider/JourneyFlow', () => ({
  JourneyFlow: () => <div data-testid="JourneyFlow">JourneyFlow</div>
}))

jest.mock('../Slider/Content', () => ({
  Content: () => <div data-testid="Content">Content</div>
}))

jest.mock('../Slider/Settings', () => ({
  Settings: () => <div data-testid="Settings">Settings</div>
}))

describe('SinglePageEditor', () => {
  it('renders JourneyFlow, Content, and Settings components', () => {
    const journey = {
      __typename: 'Journey',
      id: 'journey-id',
      title: 'Journey Title',
      description: 'Journey Description',
      slug: 'journey-slug',
      createdAt: '2021-11-19T12:34:56.647Z',
      publishedAt: null,
      status: null,
      language: null,
      themeMode: null,
      themeName: null,
      blocks: []
    } as unknown as Journey

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider initialState={{}}>
            <SinglePageEditor />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('JourneyFlow')).toBeInTheDocument()
    expect(screen.getByTestId('Content')).toBeInTheDocument()
    expect(screen.getByTestId('Settings')).toBeInTheDocument()
  })
})
