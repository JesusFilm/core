import { gql, useMutation } from '@apollo/client'
import AccordionDetails from '@mui/material/AccordionDetails'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import { Dispatch, MouseEvent, ReactElement, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import InstagramIcon from '@core/shared/ui/icons/Instagram'
import LineIcon from '@core/shared/ui/icons/Line'
import MessageTypingIcon from '@core/shared/ui/icons/MessageTyping'
import SkypeIcon from '@core/shared/ui/icons/Skype'
import SnapchatIcon from '@core/shared/ui/icons/Snapchat'
import TiktokIcon from '@core/shared/ui/icons/Tiktok'
import ViberIcon from '@core/shared/ui/icons/Viber'
import VkIcon from '@core/shared/ui/icons/Vk'

import { ChatPlatform } from '../../../../../../../../../../__generated__/globalTypes'
import { JourneyChatButtonUpdate } from '../../../../../../../../../../__generated__/JourneyChatButtonUpdate'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'

import {
  ToggleButton,
  ToggleButtonGroup as MuiToggleButtonGroup
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { ChatButtonState } from '../ChatOption'

const ToggleButtonGroup = styled(MuiToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    width: '100%',
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 8,
    backgroundColor: theme.palette[0],
    '&.Mui-selected': {
      backgroundColor: theme.palette[100],
      color: theme.palette.error.main
    }
  }
}))

export const JOURNEY_CHAT_BUTTON_UPDATE = gql`
  mutation JourneyChatButtonUpdate(
    $chatButtonUpdateId: ID!
    $journeyId: ID!
    $input: ChatButtonUpdateInput!
  ) {
    chatButtonUpdate(
      id: $chatButtonUpdateId
      journeyId: $journeyId
      input: $input
    ) {
      id
      link
      code
      type
      platform
    }
  }
`

interface DetailsProps {
  journeyId?: string
  chatButtonId?: string
  helperInfo?: string
  enableIconSelect: boolean
  enableTypeToggle: boolean
  buttonState: ChatButtonState
  setButtonState: Dispatch<SetStateAction<ChatButtonState>>
}

interface ChatPlatformOptions {
  value: ChatPlatform
  label: string
  icon: ReactElement
}

export function Details({
  journeyId,
  chatButtonId,
  helperInfo,
  enableIconSelect,
  enableTypeToggle,
  buttonState,
  setButtonState
}: DetailsProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const [journeyChatButtonUpdate] = useMutation<JourneyChatButtonUpdate>(
    JOURNEY_CHAT_BUTTON_UPDATE
  )

  const chatPlatformOptions: ChatPlatformOptions[] = [
    {
      value: ChatPlatform.custom,
      label: t('Chat'),
      icon: <MessageTypingIcon />
    },
    {
      value: ChatPlatform.instagram,
      label: t('Instagram'),
      icon: <InstagramIcon />
    },
    {
      value: ChatPlatform.line,
      label: t('LINE'),
      icon: <LineIcon />
    },
    {
      value: ChatPlatform.skype,
      label: t('Skype'),
      icon: <SkypeIcon />
    },
    {
      value: ChatPlatform.snapchat,
      label: t('Snapchat'),
      icon: <SnapchatIcon />
    },
    {
      value: ChatPlatform.tikTok,
      label: t('TikTok'),
      icon: <TiktokIcon />
    },
    {
      value: ChatPlatform.viber,
      label: t('Viber'),
      icon: <ViberIcon />
    },
    {
      value: ChatPlatform.vk,
      label: t('VK'),
      icon: <VkIcon />
    }
  ]

  const sendUpdate = async (input) => {
    if (chatButtonId == null) return

    const { data } = await journeyChatButtonUpdate({
      variables: {
        chatButtonUpdateId: chatButtonId,
        journeyId,
        input
      },
      optimisticResponse: {
        chatButtonUpdate: {
          __typename: 'ChatButton',
          id: chatButtonId,
          ...input
        }
      }
    })

    if (data != null) {
      enqueueSnackbar(t('Button updated.'), {
        variant: 'success',
        preventDuplicate: true
      })
    }
  }

  const handlePlatformChange = (value: ChatPlatform): void => {
    setButtonState((prev) => ({ ...prev, platform: value }))

    sendUpdate({
      ...buttonState,
      type: 'link',
      platform: value
    })
  }

  const handleSubmit = (value?: string): void => {
    setButtonState((prev) => ({ ...prev, [buttonState.type]: value }))

    sendUpdate({
      ...buttonState,
      [buttonState.type]: value,
      platform: buttonState.platform
    })
  }

  const handleTypeChange = (
    e: MouseEvent<HTMLElement>,
    type: string | null
  ): void => {
    if (type !== null) {
      setButtonState((prev) => ({
        ...prev,
        [type]: prev[type] || '',
        type
      }))
    }
  }

  return (
    <AccordionDetails sx={{ px: 6 }} data-testid="ChatOptionDetails">
      <Stack direction="column" spacing={8} sx={{ pb: 4 }}>
        {enableIconSelect && (
          <FormControl variant="filled" fullWidth hiddenLabel>
            <Select
              labelId="icon-select"
              value={buttonState.platform}
              displayEmpty
              onChange={(event) =>
                handlePlatformChange(event.target.value as ChatPlatform)
              }
              IconComponent={ChevronDownIcon}
            >
              {chatPlatformOptions.map(({ value, label, icon }) => (
                <MenuItem key={`chat-icon-${value}`} value={value}>
                  <Stack direction="row" spacing={5}>
                    {icon}
                    <Typography>{label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {enableTypeToggle && (
          <ToggleButtonGroup
            value={buttonState.type}
            exclusive
            onChange={handleTypeChange}
            aria-label="chat-button-type"
          >
            <ToggleButton name="link" value="link" aria-label="link">
              Link
            </ToggleButton>
            <ToggleButton name="code" value="code" aria-label="code">
              Code
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        <TextFieldForm
          id={buttonState.platform as string}
          label={
            buttonState.type === 'code'
              ? t('Paste code here')
              : t('Paste URL here')
          }
          initialValue={buttonState[buttonState.type]}
          onSubmit={(value) => handleSubmit(value)}
          multiline={buttonState.type === 'code'}
          rows={4}
        />

        {helperInfo != null && (
          <Typography variant="caption">{helperInfo}</Typography>
        )}
      </Stack>
    </AccordionDetails>
  )
}
