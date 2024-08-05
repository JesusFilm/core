import { render, screen } from '@testing-library/react'

import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { MessagePlatform } from '../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../__generated__/JourneyFields'

import { CardAnalytics } from './CardAnalytics'

describe('CardAnalytics', () => {
  it('should render stats', () => {
    const journey = {
      chatButtons: [
        {
          __typename: 'ChatButtonBlock',
          id: 'chatButton1.id',
          link: 'https://chatButton1.com',
          platform: MessagePlatform.facebook
        },
        {
          __typename: 'ChatButtonBlock',
          id: 'chatButton2.id',
          link: 'https://chatButton2.com',
          platform: MessagePlatform.custom
        }
      ]
    } as unknown as Journey
    const initialState = {
      selectedStep: { id: 'step.id' },
      analytics: {
        stepMap: new Map([
          [
            'step.id',
            {
              eventMap: new Map([
                ['footerThumbsUpButtonClick', 1],
                ['footerThumbsDownButtonClick', 2]
              ])
            }
          ]
        ]),
        targetMap: new Map([
          ['step.id->link:https://chatButton1.com:facebook', 3],
          ['step.id->link:https://chatButton2.com:custom', 4]
        ])
      }
    } as unknown as EditorState

    render(
      <JourneyProvider value={{ journey }}>
        <EditorProvider initialState={initialState}>
          <CardAnalytics />
        </EditorProvider>
      </JourneyProvider>
    )

    expect(screen.getByTestId('ThumbsUpIcon')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByTestId('ThumbsDownIcon')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByTestId('FacebookIcon')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByTestId('MessageTypingIcon')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })
})
