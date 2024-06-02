import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { MessagePlatform } from '../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../__generated__/JourneyFields'

import { Chat } from '.'

describe('Chat', () => {
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

    const { getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <Chat />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByTestId('checkbox-facebook')).toHaveClass('Mui-checked')
    expect(getByTestId('checkbox-tikTok')).toHaveClass('Mui-checked')
  })
})
