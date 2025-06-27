import { gql, useMutation } from '@apollo/client'
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
  ButtonColor,
  ButtonSize,
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
import type { IconFields } from '../Icon/__generated__/IconFields'

import {
  ButtonClickEventCreate,
  ButtonClickEventCreateVariables
} from './__generated__/ButtonClickEventCreate'
import type { ButtonFields } from './__generated__/ButtonFields'
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

// Utility function to map MUI props to Tailwind classes
function getButtonClasses(
  variant: ButtonVariant = ButtonVariant.contained,
  color: ButtonColor = ButtonColor.primary,
  size: ButtonSize = ButtonSize.medium,
  fullWidth: boolean = true
): string {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'relative',
    'box-border',
    'outline-none',
    'cursor-pointer',
    'select-none',
    'align-middle',
    'no-underline',
    'font-[Montserrat]',
    'leading-[1.75]',
    'min-w-[64px]',
    'border-0',
    'text-[#26262E]',
    'bg-[#FEFEFE]',
    'bg-red-500',
    'px-[22px]',
    'py-[8px]',
    'text-[0.9375rem]',
    'w-full',
    'transition-all',
    'duration-250',
    'ease-out',
    'h-[42px]',
    'rounded-[16px]',
    'font-bold',
    'hover:bg-[rgb(170,172,187)]',
    'hover:shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.2),0px_4px_5px_0px_rgba(0,0,0,0.14),0px_1px_10px_0px_rgba(0,0,0,0.12)]',
    'hover:no-underline'
  ]

  // Size classes - simplified since we're matching MUI exactly
  const sizeClasses = {
    [ButtonSize.small]: [],
    [ButtonSize.medium]: [],
    [ButtonSize.large]: []
  }

  // Color and variant combinations - simplified since we're using MUI exact styling
  const colorVariantClasses = {
    [ButtonVariant.contained]: {
      [ButtonColor.primary]: [],
      [ButtonColor.secondary]: ['bg-gray-500', 'text-white'],
      [ButtonColor.error]: ['bg-red-600', 'text-white'],
      [ButtonColor.inherit]: ['bg-gray-800', 'text-white']
    },
    [ButtonVariant.outlined]: {
      [ButtonColor.primary]: ['border', 'border-gray-300', 'bg-transparent'],
      [ButtonColor.secondary]: [
        'border',
        'border-gray-500',
        'bg-transparent',
        'text-gray-500'
      ],
      [ButtonColor.error]: [
        'border',
        'border-red-600',
        'bg-transparent',
        'text-red-600'
      ],
      [ButtonColor.inherit]: [
        'border',
        'border-gray-300',
        'bg-transparent',
        'text-gray-700'
      ]
    },
    [ButtonVariant.text]: {
      [ButtonColor.primary]: ['bg-transparent'],
      [ButtonColor.secondary]: ['bg-transparent', 'text-gray-500'],
      [ButtonColor.error]: ['bg-transparent', 'text-red-600'],
      [ButtonColor.inherit]: ['bg-transparent', 'text-inherit']
    }
  }

  // Width classes
  const widthClasses = fullWidth ? ['w-full', 'max-w-none'] : []

  const allClasses = [
    ...baseClasses,
    ...sizeClasses[size],
    ...colorVariantClasses[variant][color],
    ...widthClasses
  ]

  return allClasses.join(' ')
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

  const buttonClasses = getButtonClasses(
    buttonVariant ?? ButtonVariant.contained,
    buttonColor ?? ButtonColor.primary,
    size ?? ButtonSize.medium,
    true
  )

  const containerClasses = 'mb-12 mt-6'

  return (
    // Margin added via div so it's ignored by admin selection border outline
    <div className={containerClasses} data-testid={`JourneysButton-${blockId}`}>
      <button type={buttonType} onClick={handleClick} className={buttonClasses}>
        {startIcon != null && (
          <span className="mr-2">
            <Icon {...startIcon} />
          </span>
        )}
        <span>
          {editableLabel != null
            ? editableLabel
            : label !== ''
              ? label
              : fallbackLabel}
        </span>
        {endIcon != null && (
          <span className="mr-2" style={{ fontSize: '20px' }}>
            <Icon {...endIcon} />
          </span>
        )}
      </button>
    </div>
  )
}
