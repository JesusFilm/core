import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../__generated__/globalTypes'

import { BUTTON_BLOCK_CREATE } from './NewButtonButton'

import { NewButtonButton } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('NewButtonButton', () => {
  const selectedStep: TreeBlock = {
    __typename: 'StepBlock',
    id: 'stepId',
    parentBlockId: null,
    parentOrder: 0,
    locked: true,
    nextBlockId: null,
    children: [
      {
        id: 'cardId',
        __typename: 'CardBlock',
        parentBlockId: 'stepId',
        parentOrder: 0,
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: []
      }
    ]
  }

  it('should check if the mutation gets called', async () => {
    mockUuidv4.mockReturnValueOnce('buttonBlockId')
    mockUuidv4.mockReturnValueOnce('startIconId')
    mockUuidv4.mockReturnValueOnce('endIconId')

    const result = jest.fn(() => ({
      data: {
        buttonBlockCreate: {
          id: 'buttonBlockId'
        },
        startIcon: {
          __typename: 'IconBlock',
          id: 'startIconId',
          journeyId: 'journeyId',
          parentBlockId: 'buttonBlockId',
          parentOrder: null,
          iconName: null,
          iconColor: null,
          iconSize: null
        },
        endIcon: {
          __typename: 'IconBlock',
          id: 'endIconId',
          journeyId: 'journeyId',
          parentBlockId: 'buttonBlockId',
          parentOrder: null,
          iconName: null,
          iconColor: null,
          iconSize: null
        },
        buttonBlockUpdate: {
          id: 'buttonBlockId',
          parentBlockId: 'cardId',
          parentOrder: 0,
          journeyId: 'journeyId',
          label: '',
          variant: ButtonVariant.contained,
          color: ButtonColor.primary,
          size: ButtonSize.medium,
          startIconId: 'startIconId',
          endIconId: 'endIconId',
          action: null
        }
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_BLOCK_CREATE,
              variables: {
                input: {
                  id: 'buttonBlockId',
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  label: '',
                  variant: ButtonVariant.contained,
                  color: ButtonColor.primary,
                  size: ButtonSize.medium
                },
                iconBlockCreateInput1: {
                  id: 'startIconId',
                  journeyId: 'journeyId',
                  parentBlockId: 'buttonBlockId',
                  name: null
                },
                iconBlockCreateInput2: {
                  id: 'endIconId',
                  journeyId: 'journeyId',
                  parentBlockId: 'buttonBlockId',
                  name: null
                },
                id: 'buttonBlockId',
                journeyId: 'journeyId',
                updateInput: {
                  startIconId: 'startIconId',
                  endIconId: 'endIconId'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <NewButtonButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should update the cache', async () => {
    mockUuidv4.mockReturnValueOnce('buttonBlockId')
    mockUuidv4.mockReturnValueOnce('startIconId')
    mockUuidv4.mockReturnValueOnce('endIconId')

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'TypographyBlock:typographyBlockId' }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })
    const result = jest.fn(() => ({
      data: {
        buttonBlockCreate: {
          __typename: 'ButtonBlock',
          id: 'buttonBlockId'
        },
        startIcon: {
          __typename: 'IconBlock',
          id: 'startIconId',
          journeyId: 'journeyId',
          parentBlockId: 'buttonBlockId',
          parentOrder: null,
          iconName: null,
          iconColor: null,
          iconSize: null
        },
        endIcon: {
          __typename: 'IconBlock',
          id: 'endIconId',
          journeyId: 'journeyId',
          parentBlockId: 'buttonBlockId',
          parentOrder: null,
          iconName: null,
          iconColor: null,
          iconSize: null
        },
        buttonBlockUpdate: {
          __typename: 'ButtonBlock',
          id: 'buttonBlockId',
          parentBlockId: 'cardId',
          parentOrder: 0,
          journeyId: 'journeyId',
          label: '',
          buttonVariant: ButtonVariant.contained,
          buttonColor: ButtonColor.primary,
          size: ButtonSize.medium,
          startIconId: 'startIconId',
          endIconId: 'endIconId',
          action: null
        }
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: BUTTON_BLOCK_CREATE,
              variables: {
                input: {
                  id: 'buttonBlockId',
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  label: '',
                  variant: ButtonVariant.contained,
                  color: ButtonColor.primary,
                  size: ButtonSize.medium
                },
                iconBlockCreateInput1: {
                  id: 'startIconId',
                  journeyId: 'journeyId',
                  parentBlockId: 'buttonBlockId',
                  name: null
                },
                iconBlockCreateInput2: {
                  id: 'endIconId',
                  journeyId: 'journeyId',
                  parentBlockId: 'buttonBlockId',
                  name: null
                },
                id: 'buttonBlockId',
                journeyId: 'journeyId',
                updateInput: {
                  startIconId: 'startIconId',
                  endIconId: 'endIconId'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <NewButtonButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'TypographyBlock:typographyBlockId' },
      { __ref: 'ButtonBlock:buttonBlockId' },
      { __ref: 'IconBlock:startIconId' },
      { __ref: 'IconBlock:endIconId' }
    ])
  })
})
