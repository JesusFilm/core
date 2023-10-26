import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import MuiButton from '@mui/material/Button'
import { useRouter } from 'next/router'
import { MouseEvent, ReactElement, useMemo } from 'react'
import TagManager from 'react-gtm-module'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import { ButtonVariant } from '../../../__generated__/globalTypes'
import { handleAction } from '../../libs/action'
import type { TreeBlock } from '../../libs/block'
import { useBlocks } from '../../libs/block'
import { getStepHeading } from '../../libs/getStepHeading'
import { useJourney } from '../../libs/JourneyProvider'
import { Icon } from '../Icon'
import { IconFields } from '../Icon/__generated__/IconFields'

import { ButtonClickEventCreate } from './__generated__/ButtonClickEventCreate'
import { ButtonFields } from './__generated__/ButtonFields'
import { ChatOpenEventCreate } from './__generated__/ChatOpenEventCreate'
import { findChatPlatform } from './utils/findChatPlatform'
import { getActionLabel } from './utils/getActionLabel'

export const BUTTON_CLICK_EVENT_CREATE = gql`
  mutation ButtonClickEventCreate($input: ButtonClickEventCreateInput!) {
    buttonClickEventCreate(input: $input) {
      id
    }
  }
`

export const CHAT_OPEN_EVENT_CREATE = gql`
  mutation ChatOpenEventCreate($input: ChatOpenEventCreateInput!) {
    chatOpenEventCreate(input: $input) {
      id
    }
  }
`

export interface ButtonProps extends TreeBlock<ButtonFields> {
  editableLabel?: ReactElement
}

export function Button({
  id: blockId,
  buttonVariant,
  label,
  buttonColor,
  size,
  startIconId,
  endIconId,
  action,
  children,
  editableLabel
}: ButtonProps): ReactElement {
  const [buttonClickEventCreate] = useMutation<ButtonClickEventCreate>(
    BUTTON_CLICK_EVENT_CREATE
  )
  const [chatOpenEventCreate] = useMutation<ChatOpenEventCreate>(
    CHAT_OPEN_EVENT_CREATE
  )

  const { variant } = useJourney()
  const { treeBlocks, blockHistory } = useBlocks()
  const { t } = useTranslation('libs-journeys-ui')
  const activeBlock = blockHistory[blockHistory.length - 1]

  const heading =
    activeBlock != null
      ? getStepHeading(activeBlock.id, activeBlock.children, treeBlocks, t)
      : 'None'

  const startIcon = children.find((block) => block.id === startIconId) as
    | TreeBlock<IconFields>
    | undefined

  const endIcon = children.find((block) => block.id === endIconId) as
    | TreeBlock<IconFields>
    | undefined

  const chatPlatform = useMemo(() => findChatPlatform(action), [action])
  const actionValue = useMemo(
    () => getActionLabel(action, treeBlocks, t),
    [action, treeBlocks, t]
  )

  function createClickEvent(): void {
    if (variant === 'default' || variant === 'embed') {
      const id = uuidv4()
      void buttonClickEventCreate({
        variables: {
          input: {
            id,
            blockId,
            stepId: activeBlock?.id,
            label: heading,
            value: label,
            action: action?.__typename,
            actionValue
          }
        }
      })
      TagManager.dataLayer({
        dataLayer: {
          event: 'button_click',
          eventId: id,
          blockId,
          stepName: heading
        }
      })
    }
  }

  function createChatEvent(): void {
    if (variant === 'default' || variant === 'embed') {
      const id = uuidv4()
      void chatOpenEventCreate({
        variables: {
          input: {
            id,
            blockId,
            stepId: activeBlock?.id,
            value: chatPlatform
          }
        }
      })
    }
  }

  const router = useRouter()
  const handleClick = async (e: MouseEvent): Promise<void> => {
    e.stopPropagation()
    if (chatPlatform == null) {
      void createClickEvent()
    } else {
      void createChatEvent()
    }
    handleAction(router, action)
  }

  return (
    // Margin added via Box so it's ignored by admin selection border outline
    <Box
      sx={{
        mb: 4,
        mt:
          size === 'large'
            ? 6
            : size === 'medium'
            ? 5
            : size === 'small'
            ? 4
            : 5
      }}
      data-testid={`JourneysButton-${blockId}`}
    >
      <MuiButton
        variant={buttonVariant ?? ButtonVariant.contained}
        color={buttonColor ?? undefined}
        size={size ?? undefined}
        startIcon={startIcon != null ? <Icon {...startIcon} /> : undefined}
        endIcon={endIcon != null ? <Icon {...endIcon} /> : undefined}
        onClick={handleClick}
        fullWidth
        sx={
          editableLabel != null
            ? {
                '&:hover': {
                  backgroundColor:
                    buttonVariant === ButtonVariant.text
                      ? 'transparent'
                      : `${buttonColor ?? 'primary'}.main`
                }
              }
            : undefined
        }
      >
        {editableLabel ?? label}
      </MuiButton>
    </Box>
  )
}
