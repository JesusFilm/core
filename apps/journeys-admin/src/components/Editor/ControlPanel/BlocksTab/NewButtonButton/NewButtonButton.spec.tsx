import { MockedProvider } from '@apollo/client/testing'
import { InMemoryCache } from '@apollo/client'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { JourneyProvider } from '../../../../../libs/context'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { ButtonVariant, ButtonColor, ButtonSize } from '../../../../../../__generated__/globalTypes'
import { BUTTON_BLOCK_CREATE } from './NewButtonButton'
import { NewButtonButton } from '.'

describe('Button', () => {
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
    const result = jest.fn(() => ({
      data: {
        buttonBlockCreate: {
          id: 'buttonBlockId',
          parentBlockId: 'cardId',
          journeyId: 'journeyId',
          label: 'Edit Text...',
          variant: ButtonVariant.contained,
          color: ButtonColor.primary,
          size: ButtonSize.medium,
          startIconId: null,
          endIconId: null,
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
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  label: 'Edit Text...',
                  variant: ButtonVariant.contained,
                  color: ButtonColor.primary,
                  size: ButtonSize.medium
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
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
          id: 'buttonBlockId',
          parentBlockId: 'cardId',
          parentOrder: 1,
          journeyId: 'journeyId',
          label: 'Edit Text...',
          variant: ButtonVariant.contained,
          color: ButtonColor.primary,
          size: ButtonSize.large,
          startIconId: null,
          endIconId: null,
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
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  label: 'Edit Text...',
                  variant: ButtonVariant.contained,
                  color: ButtonColor.primary,
                  size: ButtonSize.medium
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
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
      { __ref: 'ButtonBlock:buttonBlockId' }
    ])
  })
})
