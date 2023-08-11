import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { ButtonFields } from '../../../../../../__generated__/ButtonFields'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { ButtonVariant } from '../../../../../../__generated__/globalTypes'

import { BUTTON_BLOCK_UPDATE_CONTENT, ButtonEdit } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('ButtonEdit', () => {
  const props: TreeBlock<ButtonFields> = {
    __typename: 'ButtonBlock',
    id: 'button.id',
    label: 'test label',
    parentBlockId: 'card',
    parentOrder: 0,
    buttonVariant: ButtonVariant.contained,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    action: null,
    children: []
  }

  it('selects the input on click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <ButtonEdit {...props} />
      </MockedProvider>
    )
    const input = getByRole('textbox')
    fireEvent.click(input)
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('placeholder', 'Edit text...')
  })

  it('saves the button label on onBlur', async () => {
    const result = jest.fn(() => ({
      data: {
        buttonBlockUpdate: [
          {
            __typename: 'ButtonBlock',
            id: 'button.id',
            label: 'updated label'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'button.id',
                journeyId: 'journeyId',
                input: {
                  label: 'updated label'
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
          <EditorProvider>
            <ButtonEdit {...props} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '    updated label    ' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should not save if the button label hasnt changed', async () => {
    const result = jest.fn(() => ({
      data: {
        buttonBlockUpdate: [
          {
            __typename: 'ButtonBlock',
            id: 'button.id',
            label: 'test label'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'button.id',
                journeyId: 'journeyId',
                input: {
                  label: 'test label'
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
          <EditorProvider>
            <ButtonEdit {...props} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox', { name: '' })
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'test label' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('saves the button label on outside click', async () => {
    const result = jest.fn(() => ({
      data: {
        buttonBlockUpdate: [
          {
            __typename: 'ButtonBlock',
            id: 'button.id',
            label: 'updated label'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'button.id',
                journeyId: 'journeyId',
                input: {
                  label: 'updated label'
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
          <EditorProvider>
            <h1 className="swiper-container">Other content</h1>
            <iframe>
              <ButtonEdit {...props} />
            </iframe>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '    updated label    ' } })
    fireEvent.click(getByRole('heading', { level: 1 }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
