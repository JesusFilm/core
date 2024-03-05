import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import TagManager from 'react-gtm-module'
import { v4 as uuidv4 } from 'uuid'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'
import { blockHistoryVar, treeBlocksVar } from '../../libs/block'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'

import { StepFields } from './__generated__/StepFields'
import { StepViewEventCreate } from './__generated__/StepViewEventCreate'
import { STEP_VIEW_EVENT_CREATE } from './Step'

import { Step } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

jest.mock('react-gtm-module', () => ({
  __esModule: true,
  default: {
    dataLayer: jest.fn()
  }
}))

const mockedDataLayer = TagManager.dataLayer as jest.MockedFunction<
  typeof TagManager.dataLayer
>

jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactElement[] }) => {
      return <>{children}</>
    }
  }
})

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
  tags: []
}

const block: TreeBlock<StepFields> = {
  __typename: 'StepBlock',
  id: 'Step1',
  parentBlockId: null,
  parentOrder: 0,
  nextBlockId: null,
  locked: false,
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
      action: null,
      children: []
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
      action: null,
      children: []
    }
  ]
}

describe('Step', () => {
  const mockStepViewEventCreate: MockedResponse<StepViewEventCreate> = {
    request: {
      query: STEP_VIEW_EVENT_CREATE,
      variables: {
        input: {
          id: 'uuid',
          blockId: 'Step1',
          value: 'Step {{number}}'
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
    mockUuidv4.mockReturnValueOnce('uuid')
    treeBlocksVar([block])
    blockHistoryVar([block])

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
  })

  it('should stepViewEvent to dataLayer', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')
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
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'step_view',
          eventId: 'uuid',
          blockId: 'Step1',
          stepName: 'Step {{number}}'
        }
      })
    )
  })

  it('should not create a stepViewEvent if there are wrappers', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')
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
    mockUuidv4.mockReturnValueOnce('uuid')

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
    mockUuidv4.mockReturnValueOnce('uuid')
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
    mockUuidv4.mockReturnValueOnce('uuid')
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

    expect(document.title).toBe('my journey (Step {{number}})')
  })

  it('should set seoTitle to [step name (journey name)] if activeStep and not on first card', () => {
    mockUuidv4.mockReturnValueOnce('uuid')
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

    expect(document.title).toBe('Step {{number}} (my journey)')
  })
})
