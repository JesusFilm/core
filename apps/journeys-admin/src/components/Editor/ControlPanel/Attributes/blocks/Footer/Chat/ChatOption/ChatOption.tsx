import { ReactElement } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useTranslation } from 'react-i18next'
import FormControl from '@mui/material/FormControl'
import Checkbox from '@mui/material/Checkbox'
import Stack from '@mui/material/Stack'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import findKey from 'lodash/findKey'
import ChatRoundedIcon from '@mui/icons-material/ChatRounded'
import { GetJourneyChatButtons_journey_chatButtons as ChatButton } from '../../../../../../../../../__generated__/GetJourneyChatButtons'
import { ChatPlatform } from '../../../../../../../../../__generated__/globalTypes'

export interface PlatformDetails {
  id: string
  title: string
  link: string | null
  active: boolean
  platform: ChatPlatform | null
  enableIconSelect?: boolean
  helperInfo?: string
}

interface Props {
  value: PlatformDetails
  disableSelection: boolean
  setButton: (value: PlatformDetails) => void
  handleUpdate: (chatButton: Omit<ChatButton, '__typename'>) => void
  handleToggle: (
    chatButton: Omit<ChatButton, '__typename'>,
    checked: boolean
  ) => void
}
export function ChatOption({
  value,
  disableSelection,
  setButton,
  handleUpdate,
  handleToggle
}: Props): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { id, active, title, link, enableIconSelect, platform, helperInfo } =
    value

  // icons equivalent to ChatPlatform from global types
  const chatIconOptions = [
    {
      value: ChatPlatform.facebook,
      label: t('Facebook'),
      icon: <ChatRoundedIcon />
    },
    {
      value: ChatPlatform.whatsApp,
      label: t('WhatsApp'),
      icon: <ChatRoundedIcon />
    },
    {
      value: ChatPlatform.telegram,
      label: t('Telegram'),
      icon: <ChatRoundedIcon />
    },
    {
      value: ChatPlatform.instagram,
      label: t('Instagram'),
      icon: <ChatRoundedIcon />
    },
    {
      value: ChatPlatform.line,
      label: t('LINE'),
      icon: <ChatRoundedIcon />
    },
    {
      value: ChatPlatform.skype,
      label: t('Skype'),
      icon: <ChatRoundedIcon />
    },
    {
      value: ChatPlatform.snapchat,
      label: t('Snapchat'),
      icon: <ChatRoundedIcon />
    },
    {
      value: ChatPlatform.tikTok,
      label: t('TikTok'),
      icon: <ChatRoundedIcon />
    },
    {
      value: ChatPlatform.viber,
      label: t('Viber'),
      icon: <ChatRoundedIcon />
    },
    {
      value: ChatPlatform.vk,
      label: t('VK'),
      icon: <ChatRoundedIcon />
    }
  ]

  function handleChangeIcon(event: SelectChangeEvent): void {
    const icon = findKey(
      ChatPlatform,
      (value) => value === event.target.value
    ) as ChatPlatform

    if (icon != null) {
      setButton({
        ...value,
        platform: icon
      })
      handleUpdate({
        id,
        link,
        platform: icon
      })
    }
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
          data-testid={`checkbox-${platform ?? 'custom'}`}
          checked={active}
          size="small"
          sx={{ p: 1, mr: 1 }}
          disabled={disableSelection && !active}
          onChange={(event) =>
            handleToggle({ id, link, platform }, event.target.checked)
          }
        />
        <Typography sx={{ my: 'auto' }}>{title}</Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 6 }}>
        <Stack direction="column" spacing={8} sx={{ pb: 4 }}>
          {enableIconSelect === true && (
            <FormControl variant="filled" fullWidth>
              <InputLabel id="icon-select">Chat Platform</InputLabel>
              <Select
                labelId="icon-select"
                label="Chat Platform"
                value={platform ?? 'default'}
                displayEmpty
                onChange={handleChangeIcon}
                IconComponent={KeyboardArrowDownRoundedIcon}
              >
                <MenuItem value="default">{t('Select an icon...')}</MenuItem>
                {chatIconOptions.map(({ value, label, icon }) => (
                  <MenuItem key={`chat-icon-${value}`} value={value}>
                    <Stack direction="row" spacing={5} sx={{ py: 3 }}>
                      {icon}
                      <Typography>{label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            variant="filled"
            placeholder="Paste URL here"
            value={link}
            label="Link"
            onChange={(event) =>
              setButton({
                ...value,
                link: event.target.value
              })
            }
            onBlur={() => handleUpdate({ id, link, platform })}
          />

          {helperInfo != null && (
            <Typography variant="caption">{helperInfo}</Typography>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
