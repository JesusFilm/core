import { render, waitFor } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { ThemeProvider } from '../ThemeProvider'
import { JourneyEdit } from './JourneyEdit'
import { Editor } from '.'

jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: () => '/journeys/my-journey/edit?stepId=step1.id',
      query: {
        stepId: 'step1.id'
      }
    }
  }
}))

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
        parentOrder: 0,
        locked: false,
        nextBlockId: 'step1.id'
      }
    ] as TreeBlock[],
    primaryImageBlock: null,
    userJourneys: [],
    seoTitle: null,
    seoDescription: null
  }

  it('should render the element', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <Editor journey={journey}>
            <JourneyEdit />
          </Editor>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('Cards')).toBeInTheDocument()
    expect(getByText('Social Share Appearance')).toBeInTheDocument()
    expect(getByText('Social Image')).toBeInTheDocument()
  })

  it('should select step based on ID', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <Editor journey={journey}>
            <JourneyEdit />
          </Editor>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByTestId('preview-step1.id').parentElement).toHaveStyle(
        'outline: 2px solid #C52D3A'
      )
    )
  })
})
