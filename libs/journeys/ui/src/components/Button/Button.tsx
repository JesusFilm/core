import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import MuiButton from '@mui/material/Button'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { usePlausible } from 'next-plausible'
import { MouseEvent, ReactElement, useMemo } from 'react'
import TagManager from 'react-gtm-module'
import { v4 as uuidv4 } from 'uuid'

import {
  ButtonAction,
  ButtonClickEventCreateInput,
  ButtonVariant,
  ChatOpenEventCreateInput
} from '../../../__generated__/globalTypes'
import { handleAction } from '../../libs/action'
import type { TreeBlock } from '../../libs/block'
import { useBlocks } from '../../libs/block'
import { getStepHeading } from '../../libs/getStepHeading'
import { useJourney } from '../../libs/JourneyProvider'
import { JourneyPlausibleEvents } from '../../libs/plausibleHelpers'
import { keyify } from '../../libs/plausibleHelpers/plausibleHelpers'
import { Icon } from '../Icon'
import { IconFields } from '../Icon/__generated__/IconFields'

import {
  ButtonClickEventCreate,
  ButtonClickEventCreateVariables
} from './__generated__/ButtonClickEventCreate'
import { ButtonFields } from './__generated__/ButtonFields'
import {
  ChatOpenEventCreate,
  ChatOpenEventCreateVariables
} from './__generated__/ChatOpenEventCreate'
import { findMessagePlatform } from './utils/findMessagePlatform'
import { getActionLabel } from './utils/getActionLabel'
import { getLinkActionGoal } from './utils/getLinkActionGoal'

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
  const [buttonClickEventCreate] = useMutation<
    ButtonClickEventCreate,
    ButtonClickEventCreateVariables
  >(BUTTON_CLICK_EVENT_CREATE)
  const [chatOpenEventCreate] = useMutation<
    ChatOpenEventCreate,
    ChatOpenEventCreateVariables
  >(CHAT_OPEN_EVENT_CREATE)

  const plausible = usePlausible<JourneyPlausibleEvents>()
  const { variant, journey } = useJourney()
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

  const messagePlatform = useMemo(() => findMessagePlatform(action), [action])
  const actionValue = useMemo(
    () => getActionLabel(action, treeBlocks, t),
    [action, treeBlocks, t]
  )

  function createClickEvent(): void {
    if (variant === 'default' || variant === 'embed') {
      const id = uuidv4()
      const input: ButtonClickEventCreateInput = {
        id,
        blockId,
        stepId: activeBlock?.id,
        label: heading,
        value: label,
        action: action?.__typename as ButtonAction | undefined,
        actionValue
      }
      void buttonClickEventCreate({
        variables: {
          input
        }
      })
      if (journey != null) {
        plausible('buttonClick', {
          u: `${window.location.origin}/${journey.id}/${input.stepId}`,
          props: {
            ...input,
            key: keyify({
              stepId: input.stepId ?? '',
              event: 'buttonClick',
              blockId: input.blockId,
              target: action
            }),
            simpleKey: keyify({
              stepId: input.stepId ?? '',
              event: 'buttonClick',
              blockId: input.blockId
            })
          }
        })
      }
      addEventToDataLayer(id)
    }
  }

  function createChatEvent(): void {
    if (variant === 'default' || variant === 'embed') {
      const id = uuidv4()
      const input: ChatOpenEventCreateInput = {
        id,
        blockId,
        stepId: activeBlock?.id,
        value: messagePlatform
      }
      void chatOpenEventCreate({
        variables: {
          input
        }
      })
      if (journey != null)
        plausible('chatButtonClick', {
          u: `${window.location.origin}/${journey.id}/${input.stepId}`,
          props: {
            ...input,
            key: keyify({
              stepId: input.stepId ?? '',
              event: 'chatButtonClick',
              blockId: input.blockId,
              target: action
            }),
            simpleKey: keyify({
              stepId: input.stepId ?? '',
              event: 'chatButtonClick',
              blockId: input.blockId
            })
          }
        })
      addEventToDataLayer(id)
    }
  }

  function addEventToDataLayer(id: string): void {
    const eventProperties = {
      eventId: id,
      blockId,
      stepName: heading
    }

    if (action?.__typename === 'LinkAction') {
      TagManager.dataLayer({
        dataLayer: {
          ...eventProperties,
          event: 'outbound_action_click',
          buttonLabel: label,
          outboundActionType: getLinkActionGoal(action.url),
          outboundActionValue: action.url
        }
      })
    } else {
      TagManager.dataLayer({
        dataLayer: {
          ...eventProperties,
          event: 'button_click'
        }
      })
    }
  }

  const router = useRouter()
  const handleClick = async (e: MouseEvent): Promise<void> => {
    e.stopPropagation()
    if (messagePlatform == null) {
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
        <span>
          {editableLabel != null
            ? editableLabel
            : label !== ''
            ? label
            : t('Submit')}
        </span>
      </MuiButton>
    </Box>
  )
}
