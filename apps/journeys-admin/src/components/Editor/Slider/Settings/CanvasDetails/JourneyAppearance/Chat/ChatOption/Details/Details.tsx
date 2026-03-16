import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useMemo, useState } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { MessageChatIcon } from '@core/journeys/ui/MessageChatIcon'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { MessagePlatform } from '../../../../../../../../../../__generated__/globalTypes'
import { JourneyChatButtonUpdate } from '../../../../../../../../../../__generated__/JourneyChatButtonUpdate'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'
import { messagePlatformToLabel } from '../../../../../../../../VisitorInfo/VisitorJourneysList/utils/messagePlatformToLabel'
import { getMessagePlatformOptions } from '../../utils/getMessagePlatformOptions'

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
      customizable
    }
  }
`

interface DetailsProps {
  journeyId?: string
  chatButtonId?: string
  currentPlatform: MessagePlatform
  currentLink: string
  currentCustomizable: boolean | null
  active: boolean
  setCurrentPlatform: (value: MessagePlatform) => void
  setCurrentLink: (value: string) => void
  helperInfo?: string
  enableIconSelect: boolean
}

export function Details({
  journeyId,
  chatButtonId,
  currentPlatform,
  currentLink,
  currentCustomizable,
  active,
  setCurrentPlatform,
  setCurrentLink,
  helperInfo,
  enableIconSelect
}: DetailsProps): ReactElement {
  const [open, setOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { add } = useCommand()
  const [journeyChatButtonUpdate] = useMutation<JourneyChatButtonUpdate>(
    JOURNEY_CHAT_BUTTON_UPDATE
  )

  const messagePlatformOptions = useMemo(
    () => getMessagePlatformOptions(t, { excludeDedicated: true }),
    [t]
  )

  async function handleUpdate(
    type: 'link' | 'platform',
    value?: string
  ): Promise<void> {
    let input
    if (type === 'link') {
      const hasProtocolPrefix = /^\w+:\/\//
      const link =
        value === ''
          ? ''
          : hasProtocolPrefix.test(value ?? '')
            ? value
            : `https://${value}`

      input = {
        link,
        platform: currentPlatform
      }
      setCurrentLink(link ?? '')
    } else {
      input = {
        link: currentLink,
        platform: value as MessagePlatform
      }
      setCurrentPlatform(value as MessagePlatform)
    }

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
          ...input,
          customizable: currentCustomizable ?? null
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

  function handleClick(): void {
    if (!open) setOpen(true)
  }

  const handleCustomizableChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (chatButtonId == null) return
    const newValue = event.target.checked
    const oldValue = currentCustomizable ?? false

    add({
      parameters: {
        execute: { customizable: newValue },
        undo: { customizable: oldValue }
      },
      execute({ customizable: value }) {
        void journeyChatButtonUpdate({
          variables: {
            chatButtonUpdateId: chatButtonId,
            journeyId,
            input: {
              customizable: value
            }
          }
        })
      }
    })
  }

  return (
    <Box sx={{ px: 6 }} data-testid="ChatOptionDetails">
      <Stack direction="column" spacing={4} sx={{ pb: 4 }}>
        {enableIconSelect && (
          <FormControl variant="filled" fullWidth hiddenLabel>
            <Select
              open={open}
              onClose={() => setOpen(false)}
              onClick={handleClick}
              labelId="icon-select"
              value={currentPlatform}
              displayEmpty
              onChange={async (event) =>
                await handleUpdate('platform', event.target.value)
              }
              IconComponent={ChevronDownIcon}
              renderValue={(selected) => (
                <Stack direction="row" spacing={5} alignItems="center">
                  <MessageChatIcon platform={selected as MessagePlatform} />
                  <Typography>
                    {messagePlatformOptions.find(
                      (opt) => opt.value === selected
                    )?.label ??
                      messagePlatformToLabel(selected as MessagePlatform, t)}
                  </Typography>
                </Stack>
              )}
            >
              {messagePlatformOptions.map(({ value, label }) => (
                <MenuItem key={`chat-icon-${value}`} value={value}>
                  <Stack direction="row" spacing={5} alignItems="center">
                    <MessageChatIcon platform={value} />
                    <Typography>{label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <TextFieldForm
          id={currentPlatform as string}
          label={t('Paste URL here')}
          initialValue={currentLink}
          onSubmit={async (value) => await handleUpdate('link', value)}
        />
        {helperInfo != null && (
          <Typography variant="caption">{helperInfo}</Typography>
        )}
        {journey?.template === true && active && (
          <Stack direction="row" alignItems="center" gap={1}>
            <Switch
              checked={currentCustomizable ?? false}
              onChange={handleCustomizableChange}
              inputProps={{ 'aria-label': t('Toggle customizable') }}
            />
            <Typography variant="body1">{t('Needs Customization')}</Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
