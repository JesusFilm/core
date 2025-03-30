import { MockedProvider } from '@apollo/client/testing'
import { render, screen, within } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { MessagePlatform } from '../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../__generated__/JourneyFields'

import { Chat } from '.'

describe('Chat', () => {
  it('should render', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <Chat />
        </JourneyProvider>
      </MockedProvider>
    )

    const accordion = screen.getByTestId('AccordionSummary')
    expect(accordion).toBeInTheDocument()
    expect(within(accordion).getByText('Chat Widget')).toBeInTheDocument()
    expect(within(accordion).getByRole('checkbox')).toBeInTheDocument()

    expect(screen.getByTestId('checkbox-facebook')).toBeInTheDocument()
    expect(screen.getByTestId('checkbox-whatsApp')).toBeInTheDocument()
    expect(screen.getByTestId('checkbox-telegram')).toBeInTheDocument()
    expect(screen.getByTestId('checkbox-custom')).toBeInTheDocument()
  })

  it('should set the initial values', () => {
    const journey = {
      chatButtons: [
        {
          __typename: 'ChatButton',
          id: '1',
          link: 'test link 1',
          platform: MessagePlatform.facebook
        },
        {
          __typename: 'ChatButton',
          id: '2',
          link: 'test link 2',
          platform: MessagePlatform.tikTok
        }
      ]
    } as unknown as Journey

    render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <Chat />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('checkbox-facebook')).toHaveClass('Mui-checked')
    expect(screen.getByTestId('checkbox-tikTok')).toHaveClass('Mui-checked')
  })
})
