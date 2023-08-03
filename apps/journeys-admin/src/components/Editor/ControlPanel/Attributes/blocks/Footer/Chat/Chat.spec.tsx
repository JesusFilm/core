import { MockedProvider } from '@apollo/client/testing'
import {
  JourneyProvider,
  RenderLocation
} from '@core/journeys/ui/JourneyProvider'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { JourneyFields as Journey } from '../../../../../../../../__generated__/JourneyFields'
import { ChatPlatform } from '../../../../../../../../__generated__/globalTypes'
import { Chat } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('Chat', () => {
  it('should set the initial values', () => {
    const journey = {
      chatButtons: [
        {
          __typename: 'ChatButton',
          id: '1',
          link: 'test link 1',
          platform: ChatPlatform.facebook
        },
        {
          __typename: 'ChatButton',
          id: '2',
          link: 'test link 2',
          platform: ChatPlatform.tikTok
        }
      ]
    } as unknown as Journey

    const { getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{ journey, renderLocation: RenderLocation.Admin }}
          >
            <Chat />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByTestId('checkbox-facebook')).toHaveClass('Mui-checked')
    expect(getByTestId('checkbox-tikTok')).toHaveClass('Mui-checked')
  })
})
