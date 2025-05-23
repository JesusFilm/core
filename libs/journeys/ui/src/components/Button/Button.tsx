import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import MuiButton from '@mui/material/Button'
import { sendGTMEvent } from '@next/third-parties/google'
import { useFormikContext } from 'formik'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { usePlausible } from 'next-plausible'
import { MouseEvent, ReactElement, useMemo } from 'react'
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
import { getNextStepSlug } from '../../libs/getNextStepSlug'
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

/**
 * Button component - An interactive button for triggering actions in a Journey.
 *
 * This component renders a button that can trigger various actions:
 * - Navigation to another step
 * - Opening external links
 * - Opening messaging platforms (WhatsApp, Messenger, etc.)
 * - Form submission
 *
 * It also tracks analytics events for button interactions and handles
 * different visual styles based on configuration.
 *
 * @param {ButtonProps} props - Component props
 * @param {string} props.id - Unique identifier for the button (blockId)
 * @param {ButtonVariant} [props.buttonVariant] - Visual style variant (contained, outlined, text)
 * @param {string} props.label - Button text label
 * @param {string} [props.buttonColor] - MUI color name for the button
 * @param {string} [props.size] - Button size (small, medium, large)
 * @param {string} [props.startIconId] - ID of an icon to display at the start of the button
 * @param {string} [props.endIconId] - ID of an icon to display at the end of the button
 * @param {Object} [props.action] - Action configuration for what happens when button is clicked
 * @param {Array<TreeBlock>} props.children - Child blocks (typically icon blocks)
 * @param {ReactElement} [props.editableLabel] - Custom label element for editable mode
 * @param {boolean} [props.submitEnabled] - Whether the button should act as a form submit button
 *
 * @returns {ReactElement} The rendered Button component
 */
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
  editableLabel,
  submitEnabled
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
  const formik = useFormikContext()
  const activeBlock = blockHistory[blockHistory.length - 1]
  const router = useRouter()

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

  const fallbackLabel = submitEnabled ? t('Submit') : t('Button')

  const buttonType = submitEnabled
    ? variant !== 'admin'
      ? 'submit'
      : 'button'
    : 'button'

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
      sendGTMEvent({
        ...eventProperties,
        event: 'outbound_action_click',
        buttonLabel: label,
        outboundActionType: getLinkActionGoal(action.url),
        outboundActionValue: action.url
      })
    } else {
      sendGTMEvent({
        ...eventProperties,
        event: 'button_click'
      })
    }
  }

  function isEmptyForm(): boolean {
    return Object.values(formik.values as string).every((value) => value === '')
  }

  const handleClick = async (e: MouseEvent): Promise<void> => {
    e.stopPropagation()

    if (submitEnabled && formik != null) {
      const errors = await formik.validateForm(formik.values)

      if (isEmptyForm()) {
        e.preventDefault()
      }

      if (!isEmptyForm() && Object.keys(errors).length > 0) return
    }

    if (messagePlatform == null) {
      void createClickEvent()
    } else {
      void createChatEvent()
    }

    const nextStepSlug = getNextStepSlug(journey, action)
    handleAction(router, action, nextStepSlug)
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
        type={buttonType}
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
              : fallbackLabel}
        </span>
      </MuiButton>
    </Box>
  )
}
