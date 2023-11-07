import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import TagManager from 'react-gtm-module'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '../../libs/block'
import { blockHistoryVar, treeBlocksVar } from '../../libs/block'
import { JourneyProvider } from '../../libs/JourneyProvider'

import { StepFields } from './__generated__/StepFields'
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

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

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
  it('should create a stepViewEvent', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')
    treeBlocksVar([block])
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
      <MockedProvider
        mocks={[
          {
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
            result
          }
        ]}
      >
        <JourneyProvider>
          <Step {...block} />
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should stepViewEvent to dataLayer', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')
    blockHistoryVar([block])
    treeBlocksVar([block])
    render(
      <MockedProvider
        mocks={[
          {
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
            result: {
              data: {
                stepViewEventCreate: {
                  id: 'uuid',
                  __typename: 'StepViewEvent'
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider>
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
      <MockedProvider
        mocks={[
          {
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
            result
          }
        ]}
      >
        <JourneyProvider>
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
      <MockedProvider>
        <Step {...block} />
      </MockedProvider>
    )
    expect(getByText('Button 1')).toBeInTheDocument()
    expect(getByText('Button 2')).toBeInTheDocument()
  })

  it('should render empty block', () => {
    const { baseElement } = render(
      <MockedProvider>
        {/* eslint-disable-next-line react/no-children-prop */}
        <Step {...block} children={[]} />
      </MockedProvider>
    )
    expect(baseElement).toContainHTML('<body><div /></body>')
  })
})
