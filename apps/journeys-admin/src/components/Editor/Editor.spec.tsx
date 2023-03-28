import { render } from '@testing-library/react'
import type { TreeBlock } from '@core/journeys/ui/block'
import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { ThemeProvider } from '../ThemeProvider'
import { JourneyEdit } from './JourneyEdit'
import { Editor } from '.'

describe('Editor', () => {
  const journey: Journey = {
    __typename: 'Journey',
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    title: 'my journey',
    slug: 'my-journey',
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      iso3: 'eng',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    },
    description: 'my cool journey',
    status: JourneyStatus.draft,
    createdAt: '2021-11-19T12:34:56.647Z',
    publishedAt: null,
    blocks: [
      {
        id: 'step0.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: 'step1.id'
      },
      {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 1,
        locked: false,
        nextBlockId: 'step1.id'
      }
    ] as TreeBlock[],
    primaryImageBlock: null,
    userJourneys: [],
    template: null,
    seoTitle: null,
    seoDescription: null
  }

  it('should render the element', () => {
    const { getByText } = render(
      <MockedProvider>
        <FlagsProvider>
          <ThemeProvider>
            <Editor journey={journey}>
              <JourneyEdit />
            </Editor>
          </ThemeProvider>
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByText('Cards')).toBeInTheDocument()
    expect(getByText('Social Share Appearance')).toBeInTheDocument()
    expect(getByText('Social Image')).toBeInTheDocument()
  })

  it('should display Next Card property', () => {
    const { getByText } = render(
      <MockedProvider>
        <FlagsProvider>
          <ThemeProvider>
            <Editor journey={journey} selectedStepId="step0.id">
              <JourneyEdit />
            </Editor>
          </ThemeProvider>
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByText('Next Card')).toBeInTheDocument()
    expect(getByText('Unlocked Card')).toBeInTheDocument()
  })

  it('should display Social Preview', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <FlagsProvider>
          <ThemeProvider>
            <Editor
              journey={journey}
              view={ActiveJourneyEditContent.SocialPreview}
            >
              <JourneyEdit />
            </Editor>
          </ThemeProvider>
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByTestId('social-preview-panel')).toBeInTheDocument()
    expect(getByTestId('journey-edit-content')).toHaveStyle({
      backgroundColor: 'none'
    })
  })
})
