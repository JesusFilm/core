import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { MessagePlatform } from '../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../__generated__/JourneyFields'

import { Chat } from '.'

const renderChat = (
  chatButtons: Journey['chatButtons']
): ReturnType<typeof render> => {
  const journey = { chatButtons } as unknown as Journey
  return render(
    <MockedProvider>
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

  it('should render 2 dedicated buttons with both custom rows inactive', () => {
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
    const customCheckboxes = screen.getAllByTestId('checkbox-custom')
    customCheckboxes.forEach((checkbox) => {
      expect(checkbox).not.toHaveClass('Mui-checked')
    })
  })

  it('should render a single custom button with the second custom row inactive', () => {
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
    expect(screen.getByTestId('checkbox-custom')).not.toHaveClass('Mui-checked')
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
    ).toBeVisible()
    expect(screen.getByTestId('checkbox-facebook')).toHaveAttribute('disabled')
    expect(screen.getByTestId('checkbox-telegram')).toHaveAttribute('disabled')
  })
})
