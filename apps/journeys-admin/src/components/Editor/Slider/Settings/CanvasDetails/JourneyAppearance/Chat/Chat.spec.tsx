import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { MessagePlatform } from '../../../../../../../../__generated__/globalTypes'
import { JourneyChatButtonCreate } from '../../../../../../../../__generated__/JourneyChatButtonCreate'
import { JourneyFields as Journey } from '../../../../../../../../__generated__/JourneyFields'

import { JOURNEY_CHAT_BUTTON_CREATE } from './ChatOption/Summary/Summary'

import { Chat } from '.'

const renderChat = (
  chatButtons: Journey['chatButtons'],
  mocks: MockedResponse[] = [],
  journeyId = 'journey-1'
): ReturnType<typeof render> => {
  const journey = { id: journeyId, chatButtons } as unknown as Journey
  return render(
    <MockedProvider mocks={mocks}>
      <SnackbarProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <Chat />
        </JourneyProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('Chat', () => {
  it('should render 1 dedicated + 1 custom button', () => {
    renderChat([
      {
        __typename: 'ChatButton',
        id: '1',
        link: 'test link 1',
        platform: MessagePlatform.facebook,
        customizable: null
      },
      {
        __typename: 'ChatButton',
        id: '2',
        link: 'test link 2',
        platform: MessagePlatform.tikTok,
        customizable: null
      }
    ])

    expect(screen.getByTestId('checkbox-facebook')).toHaveClass('Mui-checked')
    expect(screen.getByTestId('checkbox-tikTok')).toHaveClass('Mui-checked')
  })

  it('should render 2 non-dedicated custom buttons', () => {
    renderChat([
      {
        __typename: 'ChatButton',
        id: '1',
        link: 'https://line.me/test',
        platform: MessagePlatform.line,
        customizable: null
      },
      {
        __typename: 'ChatButton',
        id: '2',
        link: 'https://snapchat.com/test',
        platform: MessagePlatform.snapchat,
        customizable: null
      }
    ])

    expect(screen.getByTestId('checkbox-line')).toHaveClass('Mui-checked')
    expect(screen.getByTestId('checkbox-snapchat')).toHaveClass('Mui-checked')
  })

  it('should render 2 dedicated buttons with custom row inactive and no 2nd custom row', () => {
    renderChat([
      {
        __typename: 'ChatButton',
        id: '1',
        link: 'https://m.me/test',
        platform: MessagePlatform.facebook,
        customizable: null
      },
      {
        __typename: 'ChatButton',
        id: '2',
        link: 'https://t.me/test',
        platform: MessagePlatform.telegram,
        customizable: null
      }
    ])

    expect(screen.getByTestId('checkbox-facebook')).toHaveClass('Mui-checked')
    expect(screen.getByTestId('checkbox-telegram')).toHaveClass('Mui-checked')
    expect(screen.getByTestId('checkbox-custom')).not.toHaveClass('Mui-checked')
  })

  it('should render a single custom button with add 2nd custom button', () => {
    renderChat([
      {
        __typename: 'ChatButton',
        id: '1',
        link: 'https://viber.com/test',
        platform: MessagePlatform.viber,
        customizable: null
      }
    ])

    expect(screen.getByTestId('checkbox-viber')).toHaveClass('Mui-checked')
    expect(screen.getByText('+ Add 2nd Custom Button')).toBeInTheDocument()
  })

  it('should show max selection message and disable unchecked rows when 2 buttons exist', () => {
    renderChat([
      {
        __typename: 'ChatButton',
        id: '1',
        link: 'https://wa.me/test',
        platform: MessagePlatform.whatsApp,
        customizable: null
      },
      {
        __typename: 'ChatButton',
        id: '2',
        link: 'https://line.me/test',
        platform: MessagePlatform.line,
        customizable: null
      }
    ])

    expect(
      screen.getByText('You can add no more than two chat platforms')
    ).toBeInTheDocument()
    expect(screen.getByTestId('checkbox-facebook')).toHaveClass('Mui-disabled')
    expect(screen.getByTestId('checkbox-telegram')).toHaveClass('Mui-disabled')
  })

  it('should not show add 2nd custom button when max selection reached', () => {
    renderChat([
      {
        __typename: 'ChatButton',
        id: '1',
        link: 'https://wa.me/test',
        platform: MessagePlatform.whatsApp,
        customizable: null
      },
      {
        __typename: 'ChatButton',
        id: '2',
        link: 'https://line.me/test',
        platform: MessagePlatform.line,
        customizable: null
      }
    ])

    expect(
      screen.queryByText('+ Add 2nd Custom Button')
    ).not.toBeInTheDocument()
  })

  it('should not show add 2nd custom button when no custom buttons exist', () => {
    renderChat([
      {
        __typename: 'ChatButton',
        id: '1',
        link: 'https://m.me/test',
        platform: MessagePlatform.facebook,
        customizable: null
      }
    ])

    expect(
      screen.queryByText('+ Add 2nd Custom Button')
    ).not.toBeInTheDocument()
  })

  it('should not show add 2nd custom button when 2 custom buttons already exist', () => {
    renderChat([
      {
        __typename: 'ChatButton',
        id: '1',
        link: 'https://line.me/test',
        platform: MessagePlatform.line,
        customizable: null
      },
      {
        __typename: 'ChatButton',
        id: '2',
        link: 'https://snapchat.com/test',
        platform: MessagePlatform.snapchat,
        customizable: null
      }
    ])

    expect(
      screen.queryByText('+ Add 2nd Custom Button')
    ).not.toBeInTheDocument()
  })

  it('should call chatButtonCreate when add 2nd custom button is clicked', async () => {
    const mockResult = jest.fn(() => ({
      data: {
        chatButtonCreate: {
          __typename: 'ChatButton' as const,
          id: 'new-button',
          link: '',
          platform: MessagePlatform.custom,
          customizable: null
        }
      }
    }))

    const createMock: MockedResponse<JourneyChatButtonCreate> = {
      request: {
        query: JOURNEY_CHAT_BUTTON_CREATE,
        variables: {
          journeyId: 'journey-1',
          input: {
            link: '',
            platform: MessagePlatform.custom
          }
        }
      },
      result: mockResult
    }

    renderChat(
      [
        {
          __typename: 'ChatButton',
          id: '1',
          link: 'https://viber.com/test',
          platform: MessagePlatform.viber,
          customizable: null
        }
      ],
      [createMock]
    )

    const addButton = screen.getByText('+ Add 2nd Custom Button')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(mockResult).toHaveBeenCalled()
    })
  })
})
