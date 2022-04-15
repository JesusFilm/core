import { render, fireEvent } from '@testing-library/react'
import { ReactElement } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import Button from '@mui/material/Button'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { JourneyProvider, useJourney } from '.'

const checkJourney = jest.fn()

const TestComponent = (): ReactElement => {
  const journey = useJourney()

  return <Button onClick={checkJourney(journey)}>Test</Button>
}

const journey: Journey = {
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
  userJourneys: [],
  seoTitle: null,
  seoDescription: null
}

describe('JourneyContext', () => {
  it('should pass through the journey props', () => {
    const { getByRole } = render(
      <JourneyProvider value={journey}>
        <TestComponent />
      </JourneyProvider>
    )

    fireEvent.click(getByRole('button'))

    expect(checkJourney).toBeCalledWith({
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
      userJourneys: [],
      seoTitle: null,
      seoDescription: null
    })
  })
})
