import { gql, useMutation } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { usePlausible } from 'next-plausible'
import { ReactElement } from 'react'

import Plus2 from '@core/shared/ui/icons/Plus2'

import {
  ChatOpenEventCreateInput,
  MessagePlatform
} from '../../../../__generated__/globalTypes'
import { useBlocks } from '../../../libs/block'
import { useJourney } from '../../../libs/JourneyProvider'
import { JourneyFields_chatButtons as ChatButton } from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { MessageChatIcon } from '../../../libs/MessageChatIcon'
import { JourneyPlausibleEvents, keyify } from '../../../libs/plausibleHelpers'
import { getJourneyRTL } from '../../../libs/rtl'

import {
  ChatButtonEventCreate,
  ChatButtonEventCreateVariables
} from './__generated__/ChatButtonEventCreate'
import { AiChatButton } from '../../AiChatButton'

export const CHAT_BUTTON_EVENT_CREATE = gql`
  mutation ChatButtonEventCreate($input: ChatOpenEventCreateInput!) {
    chatOpenEventCreate(input: $input) {
      id
    }
  }
`

export function ChatButtons(): ReactElement {
  const plausible = usePlausible<JourneyPlausibleEvents>()
  const { variant, journey } = useJourney()
  const { blockHistory } = useBlocks()
  const theme = useTheme()
  const { rtl } = getJourneyRTL(journey)

  const activeBlock = blockHistory[blockHistory.length - 1]
  const chatButtons = journey?.chatButtons
  const isWebsite = journey?.website === true
  const showDefault = variant === 'admin' && chatButtons?.length === 0

  const [chatButtonEventCreate] = useMutation<
    ChatButtonEventCreate,
    ChatButtonEventCreateVariables
  >(CHAT_BUTTON_EVENT_CREATE)

  const getColor = (
    primary: boolean,
    type: 'main' | 'background' | 'website' = 'main'
  ): string | undefined => {
    if (type === 'background') {
      return primary ? theme.palette.grey[100] : `${theme.palette.grey[200]}40`
    }
    if (type === 'main') {
      return primary ? theme.palette.grey[900] : theme.palette.grey[100]
    }
    if (type === 'website') {
      return primary ? theme.palette.grey[100] : `${theme.palette.grey[900]}88`
    }
  }

  const handleClick = (chatButton: ChatButton): void => {
    if (
      (variant === 'default' || variant === 'embed') &&
      chatButton.link != null
    ) {
      window.open(chatButton.link, '_blank')
      const input: ChatOpenEventCreateInput = {
        id: chatButton?.id,
        blockId: activeBlock?.id,
        stepId: activeBlock?.id,
        value: chatButton?.platform
      }
      void chatButtonEventCreate({
        variables: {
          input: {
            blockId: activeBlock?.id,
            stepId: activeBlock?.id,
            value: chatButton?.platform
          }
        }
      })
      if (journey != null)
        plausible('footerChatButtonClick', {
          u: `${window.location.origin}/${journey.id}/${input.stepId}`,
          props: {
            ...input,
            key: keyify({
              stepId: input.stepId ?? '',
              event: 'footerChatButtonClick',
              blockId: input.blockId,
              target: `link:${chatButton.link}:${chatButton.platform}`
            }),
            simpleKey: keyify({
              stepId: input.stepId ?? '',
              event: 'footerChatButtonClick',
              blockId: input.blockId
            })
          }
        })
    }
  }

  return (
    <Stack
      data-testid="StepFooterChatButtons"
      direction={rtl ? 'row' : 'row-reverse'}
      gap={2}
    >
      {chatButtons?.map((chatButton, index) => (
        <IconButton
          key={chatButton?.id}
          onClick={() => handleClick(chatButton)}
          sx={{
            height: 44,
            width: 44,
            backgroundColor: getColor(
              index === 0,
              isWebsite ? 'website' : 'background'
            ),
            '&:hover': {
              backgroundColor: getColor(
                index === 0,
                isWebsite ? 'website' : 'background'
              )
            },
            backdropFilter: 'blur(5px)',
            boxShadow: (theme) =>
              isWebsite ? `0px 6px 6px ${theme.palette.grey[900]}60` : undefined
          }}
        >
          <MessageChatIcon
            platform={chatButton.platform ?? MessagePlatform.custom}
            sx={{ color: getColor(index === 0, 'main') }}
          />
        </IconButton>
      ))}
      <AiChatButton />
      {showDefault && (
        <IconButton
          key="default"
          disabled
          sx={{
            height: 44,
            width: 44,
            outline: 'none',
            border: '3px dashed ',
            opacity: 0.5,
            borderColor: (theme) => theme.palette.grey[700]
          }}
        >
          <Plus2 sx={{ color: (theme) => theme.palette.grey[700] }} />
        </IconButton>
      )}
    </Stack>
  )
}
