import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { sendGTMEvent } from '@next/third-parties/google'
import { render, waitFor } from '@testing-library/react'
import { usePlausible } from 'next-plausible'
import { v4 as uuidv4 } from 'uuid'

import {
  BlockEventLabel,
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'
import { blockHistoryVar, treeBlocksVar } from '../../libs/block'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { keyify, templateKeyify } from '../../libs/plausibleHelpers'

import { StepFields } from './__generated__/StepFields'
import { StepViewEventCreate } from './__generated__/StepViewEventCreate'
import { STEP_VIEW_EVENT_CREATE, Step } from './Step'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

jest.mock('@next/third-parties/google', () => ({
  sendGTMEvent: jest.fn()
}))

const mockedSendGTMEvent = sendGTMEvent as jest.MockedFunction<
  typeof sendGTMEvent
>

jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactElement[] }) => {
      return <>{children}</>
    }
  }
})

jest.mock('next-plausible', () => ({
  __esModule: true,
  usePlausible: jest.fn()
}))

const mockUsePlausible = usePlausible as jest.MockedFunction<
  typeof usePlausible
>

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  featuredAt: null,
  title: 'my journey',
  strategySlug: null,
  slug: 'my-journey',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  updatedAt: '2021-11-19T12:34:56.647Z',
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
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null,
  tags: [],
  website: null,
  showShareButton: null,
  showLikeButton: null,
  showDislikeButton: null,
  displayTitle: null,
  logoImageBlock: null,
  menuButtonIcon: null,
  menuStepBlock: null,
  journeyTheme: null,
  journeyCustomizationDescription: null,
  journeyCustomizationFields: [
    {
      __typename: 'JourneyCustomizationField',
      id: 'customization1',
      journeyId: 'journeyId',
      key: 'number',
      value: '1',
      defaultValue: '0'
    }
  ],
  fromTemplateId: null,
  socialNodeX: null,
  socialNodeY: null
}

const block: TreeBlock<StepFields> = {
  __typename: 'StepBlock',
  id: 'Step1',
  parentBlockId: null,
  parentOrder: 0,
  nextBlockId: null,
  locked: false,
  slug: null,
  children: [
    {
      __typename: 'ButtonBlock',
      id: 'Button1',
      parentBlockId: 'Step1',
      parentOrder: 0,
      label: 'Button 1',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: null,
      children: [],
      settings: null,
      eventLabel: null
    },
    {
      __typename: 'ButtonBlock',
      id: 'Button2',
      parentBlockId: 'Step1',
      parentOrder: 1,
      label: 'Button 2',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: null,
      children: [],
      settings: null,
      eventLabel: null
    }
  ]
}

describe('Step', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUuidv4.mockReturnValueOnce('uuid')
    blockHistoryVar([])
    treeBlocksVar([])
  })

  const mockStepViewEventCreate: MockedResponse<StepViewEventCreate> = {
    request: {
      query: STEP_VIEW_EVENT_CREATE,
      variables: {
        input: {
          id: 'uuid',
          blockId: 'Step1',
          value: 'Step 1'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        stepViewEventCreate: {
          id: 'uuid',
          __typename: 'StepViewEvent'
        }
      }
    }))
  }

  it('should create a stepViewEvent', async () => {
    treeBlocksVar([block])
    blockHistoryVar([block])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    render(
      <MockedProvider mocks={[mockStepViewEventCreate]}>
        <JourneyProvider value={{ journey }}>
          <Step {...block} />
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(mockStepViewEventCreate.result).toHaveBeenCalled()
    )
    expect(mockPlausible).toHaveBeenCalledWith('pageview', {
      u: expect.stringContaining(`/journeyId/Step1`),
      props: {
        id: 'uuid',
        blockId: 'Step1',
        value: 'Step 1',
        key: keyify({
          stepId: 'Step1',
          event: 'pageview',
          blockId: 'Step1',
          journeyId: 'journeyId'
        }),
        simpleKey: keyify({
          stepId: 'Step1',
          event: 'pageview',
          blockId: 'Step1',
          journeyId: 'journeyId'
        }),
        templateKey: templateKeyify({
          event: 'pageview',
          journeyId: 'journeyId'
        })
      }
    })
  })

  it('should call plausible with eventLabel for pageview events', async () => {
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    const blockWithCardBlock: TreeBlock<StepFields> = {
      ...block,
      children: [
        {
          __typename: 'CardBlock',
          id: 'Card1',
          parentBlockId: 'Step1',
          parentOrder: 0,
          backgroundColor: null,
          coverBlockId: null,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          backdropBlur: null,
          eventLabel: BlockEventLabel.custom1,
          children: []
        }
      ]
    }

    treeBlocksVar([blockWithCardBlock])
    blockHistoryVar([blockWithCardBlock])

    render(
      <MockedProvider mocks={[mockStepViewEventCreate]}>
        <JourneyProvider value={{ journey }}>
          <Step {...blockWithCardBlock} />
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(mockStepViewEventCreate.result).toHaveBeenCalled()
    )
    expect(mockPlausible).toHaveBeenCalledWith('pageview', expect.any(Object))
    expect(mockPlausible).toHaveBeenCalledWith(BlockEventLabel.custom1, {
      u: expect.stringContaining(`/journeyId/Step1`),
      props: {
        id: 'uuid',
        blockId: 'Step1',
        value: 'Step 1',
        key: keyify({
          stepId: 'Step1',
          event: BlockEventLabel.custom1,
          blockId: 'Step1',
          journeyId: 'journeyId'
        }),
        simpleKey: keyify({
          stepId: 'Step1',
          event: BlockEventLabel.custom1,
          blockId: 'Step1',
          journeyId: 'journeyId'
        }),
        templateKey: templateKeyify({
          event: BlockEventLabel.custom1,
          journeyId: 'journeyId'
        })
      }
    })
  })

  xit('should create a stepViewEvent with a UTM code', async () => {
    // disabled due to Jest v30 compatibility issues
    const mockSearch = '?utm_source=source&utm_campaign=campaign'

    treeBlocksVar([block])
    blockHistoryVar([block])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    render(
      <MockedProvider mocks={[mockStepViewEventCreate]}>
        <JourneyProvider value={{ journey }}>
          <Step {...block} />
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(mockStepViewEventCreate.result).toHaveBeenCalled()
    )
    expect(mockPlausible).toHaveBeenCalledWith('pageview', {
      u: expect.stringContaining(`/journeyId/Step1/${mockSearch}`),
      props: {
        id: 'uuid',
        blockId: 'Step1',
        value: 'Step 1',
        key: keyify({
          stepId: 'Step1',
          event: 'pageview',
          blockId: 'Step1',
          journeyId: 'journeyId'
        }),
        simpleKey: keyify({
          stepId: 'Step1',
          event: 'pageview',
          blockId: 'Step1',
          journeyId: 'journeyId'
        }),
        templateKey: templateKeyify({
          event: 'pageview',
          journeyId: 'journeyId'
        })
      }
    })
  })

  it('should stepViewEvent to dataLayer', async () => {
    mockUsePlausible.mockReturnValue(jest.fn())
    blockHistoryVar([block])
    treeBlocksVar([block])
    render(
      <MockedProvider mocks={[mockStepViewEventCreate]}>
        <JourneyProvider value={{ journey }}>
          <Step {...block} />
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'step_view',
        eventId: 'uuid',
        blockId: 'Step1',
        stepName: 'Step 1'
      })
    )
  })

  it('should not create a stepViewEvent if there are wrappers', async () => {
    blockHistoryVar([block])

    const result = jest.fn(() => ({
      data: {
        stepViewEventCreate: {
          id: 'uuid',
          __typename: 'StepViewEvent'
        }
      }
    }))

    render(
      <MockedProvider mocks={[{ ...mockStepViewEventCreate, result }]}>
        <JourneyProvider value={{ journey }}>
          <Step
            {...block}
            wrappers={{
              Wrapper: ({ children }) => <div>{children}</div>
            }}
          />
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('should render blocks', () => {

    const { getByText } = render(
      <MockedProvider mocks={[mockStepViewEventCreate]}>
        <Step {...block} />
      </MockedProvider>
    )

    expect(getByText('Button 1')).toBeInTheDocument()
    expect(getByText('Button 2')).toBeInTheDocument()
  })

  it('should render empty block', () => {
    blockHistoryVar([])
    treeBlocksVar([])

    const { baseElement } = render(
      <MockedProvider mocks={[mockStepViewEventCreate]}>
        <JourneyProvider value={{ journey }}>
          {/* eslint-disable-next-line react/no-children-prop */}
          <Step {...block} children={[]} />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(baseElement).toContainHTML('<body><div /></body>')
  })

  it('should not send stepViewEvent if not activeStep', async () => {
    treeBlocksVar([])
    blockHistoryVar([block, { ...block, id: 'Step2' }])

    const result = jest.fn(() => ({
      data: {
        stepViewEventCreate: {
          id: 'uuid',
          __typename: 'StepViewEvent'
        }
      }
    }))

    render(
      <MockedProvider mocks={[{ ...mockStepViewEventCreate, result }]}>
        <JourneyProvider value={{ journey }}>
          <Step {...block} />
        </JourneyProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('should set seoTitle to [journey name (step name)] if activeStep and on first card', () => {
    mockUsePlausible.mockReturnValue(jest.fn())
    treeBlocksVar([block])
    blockHistoryVar([block])

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <Step {...block} />
        </JourneyProvider>
      </MockedProvider>,
      { container: document.head }
    )

    expect(document.title).toBe('my journey (Step 1)')
  })

  it('should set seoTitle to [step name (journey name)] if activeStep and not on first card', () => {
    mockUsePlausible.mockReturnValue(jest.fn())
    treeBlocksVar([{ ...block, id: 'Step0' }, block])
    blockHistoryVar([block])

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <Step {...block} />
        </JourneyProvider>
      </MockedProvider>,
      { container: document.head }
    )

    expect(document.title).toBe('Step 1 (my journey)')
  })
})
