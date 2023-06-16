import { ReactElement, ChangeEvent } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Select from '@mui/material/Select'
import Instagram from '@core/shared/ui/icons/Instagram'
import Viber from '@core/shared/ui/icons/Viber'
import Vk from '@core/shared/ui/icons/Vk'
import Snapchat from '@core/shared/ui/icons/Snapchat'
import Skype from '@core/shared/ui/icons/Skype'
import Line from '@core/shared/ui/icons/Line'
import Tiktok from '@core/shared/ui/icons/Tiktok'
import MenuItem from '@mui/material/MenuItem'
import { useTranslation } from 'react-i18next'
import FormControl from '@mui/material/FormControl'
import Checkbox from '@mui/material/Checkbox'
import Stack from '@mui/material/Stack'
import { gql, useMutation } from '@apollo/client'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import { JourneyFields_chatButtons as ChatButton } from '../../../../../../../../../__generated__/JourneyFields'
import { ChatPlatform } from '../../../../../../../../../__generated__/globalTypes'
import { TextFieldForm } from '../../../../../../../TextFieldForm'
import { JourneyChatButtonCreate } from '../../../../../../../../../__generated__/JourneyChatButtonCreate'
import { JourneyChatButtonUpdate } from '../../../../../../../../../__generated__/JourneyChatButtonUpdate'
import { JourneyChatButtonRemove } from '../../../../../../../../../__generated__/JourneyChatButtonRemove'

export const JOURNEY_CHAT_BUTTON_CREATE = gql`
  mutation JourneyChatButtonCreate(
    $journeyId: ID!
    $input: ChatButtonCreateInput
  ) {
    chatButtonCreate(journeyId: $journeyId, input: $input) {
      id
      link
      platform
    }
  }
`

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
      platform
    }
  }
`

export const JOURNEY_CHAT_BUTTON_REMOVE = gql`
  mutation JourneyChatButtonRemove($chatButtonRemoveId: ID!) {
    chatButtonRemove(id: $chatButtonRemoveId) {
      id
    }
  }
`

interface Props {
  title: string
  chatButton?: ChatButton
  platform?: ChatPlatform
  active: boolean
  helperInfo?: string
  journeyId?: string
  disableSelection: boolean
  enableIconSelect?: boolean
}
export function ChatOption({
  title,
  chatButton,
  platform,
  active,
  helperInfo,
  journeyId,
  disableSelection,
  enableIconSelect = false
}: Props): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [journeyChatButtonCreate] = useMutation<JourneyChatButtonCreate>(
    JOURNEY_CHAT_BUTTON_CREATE
  )
  const [journeyChatButtonUpdate] = useMutation<JourneyChatButtonUpdate>(
    JOURNEY_CHAT_BUTTON_UPDATE
  )
  const [journeyChatButtonRemove] = useMutation<JourneyChatButtonRemove>(
    JOURNEY_CHAT_BUTTON_REMOVE
  )

  // icons equivalent to ChatPlatform from global types
  const chatIconOptions = [
    {
      value: ChatPlatform.instagram,
      label: t('Instagram'),
      icon: <Instagram />
    },
    {
      value: ChatPlatform.line,
      label: t('LINE'),
      icon: <Line />
    },
    {
      value: ChatPlatform.skype,
      label: t('Skype'),
      icon: <Skype />
    },
    {
      value: ChatPlatform.snapchat,
      label: t('Snapchat'),
      icon: <Snapchat />
    },
    {
      value: ChatPlatform.tikTok,
      label: t('TikTok'),
      icon: <Tiktok />
    },
    {
      value: ChatPlatform.viber,
      label: t('Viber'),
      icon: <Viber />
    },
    {
      value: ChatPlatform.vk,
      label: t('VK'),
      icon: <Vk />
    }
  ]

  async function handleToggle(
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    if (event.target.checked && !disableSelection) {
      await journeyChatButtonCreate({
        variables: {
          journeyId,
          link: chatButton?.link,
          platform: platform ?? chatButton?.platform ?? null
        }
      })
    } else {
      if (chatButton != null) {
        await journeyChatButtonRemove({
          variables: { chatButtonRemoveId: chatButton.id }
        })
      }
    }
  }

  async function handleUpdate(
    value: string | ChatPlatform | undefined,
    type: 'link' | 'platform'
  ): Promise<void> {
    if (chatButton?.id == null) return

    const input =
      type === 'link'
        ? {
            link: value as string,
            platform: chatButton.platform
          }
        : {
            link: chatButton.link,
            platform: value !== 'default' ? (value as ChatPlatform) : null
          }

    await journeyChatButtonUpdate({
      variables: {
        chatButtonUpdateId: chatButton.id,
        journeyId,
        input
      },
      optimisticResponse: {
        chatButtonUpdate: {
          __typename: 'ChatButton',
          id: chatButton.id,
          ...input
        }
      }
    })
  }

  return (
    <Accordion
      disableGutters
      square
      sx={{
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        '&:not(:last-child)': {
          borderBottom: 0
        }
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 6, py: 2 }}>
        <Checkbox
          data-testid={`checkbox-${chatButton?.platform ?? 'custom'}`}
          checked={active}
          size="small"
          sx={{ p: 1, mr: 1 }}
          disabled={disableSelection && !active}
          onChange={handleToggle}
        />
        <Typography sx={{ my: 'auto' }}>{title}</Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 6 }}>
        <Stack direction="column" spacing={8} sx={{ pb: 4 }}>
          {enableIconSelect && (
            <FormControl variant="filled" fullWidth hiddenLabel>
              <Select
                labelId="icon-select"
                value={chatButton?.platform ?? 'default'}
                displayEmpty
                onChange={async (event) =>
                  await handleUpdate(event.target.value, 'platform')
                }
                IconComponent={KeyboardArrowDownRoundedIcon}
              >
                <MenuItem value="default">{t('Select an icon...')}</MenuItem>
                {chatIconOptions.map(({ value, label, icon }) => (
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

          <TextFieldForm
            placeholder={t('Paste URL here')}
            hiddenLabel
            handleSubmit={async (value) => await handleUpdate(value, 'link')}
          />

          {helperInfo != null && (
            <Typography variant="caption">{helperInfo}</Typography>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
