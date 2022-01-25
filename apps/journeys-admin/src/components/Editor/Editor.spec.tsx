import { render } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { ThemeProvider } from '../ThemeProvider'
import { Editor } from '.'

describe('Editor', () => {
  it('should render the element', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <Editor
            journey={{
              __typename: 'Journey',
              id: 'journeyId',
              themeName: ThemeName.base,
              themeMode: ThemeMode.light,
              title: 'my journey',
              slug: 'my-journey',
              locale: 'en-US',
              description: 'my cool journey',
              status: JourneyStatus.draft,
              createdAt: '2021-11-19T12:34:56.647Z',
              publishedAt: null,
              blocks: [
                {
                  id: 'step0.id',
                  __typename: 'StepBlock',
                  parentBlockId: null,
                  locked: false,
                  nextBlockId: 'step1.id'
                }
              ] as TreeBlock[],
              primaryImageBlock: null,
              userJourneys: []
            }}
          />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('Cards')).toBeInTheDocument()
    expect(getByText('Social Share Appearance')).toBeInTheDocument()
    expect(getByText('Social Image')).toBeInTheDocument()
  })
})
