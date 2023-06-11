import { ReactElement } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import TextField from '@mui/material/TextField'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Checkbox from '@mui/material/Checkbox'
import Stack from '@mui/material/Stack'
import findKey from 'lodash/findKey'

export enum ChatIcon {
  default = 'default',
  facebook = 'facebook',
  whatsApp = 'whatsApp',
  telegram = 'telegram',
  line = 'line',
  snapChat = 'snapChat',
  instagram = 'instagram'
}

export interface ChatPlatformSelection {
  id: string
  title: string
  linkValue: string
  active: boolean
  chatIcon: ChatIcon
  enableScript?: boolean
  type?: 'link' | 'script'
  scriptValue: string
  enableIconSelect?: boolean
}

interface Props {
  value: ChatPlatformSelection
  setValue: (value: ChatPlatformSelection) => void
  handleUpdate: () => void
  handleToggle: (id: string, checked: boolean) => void
}
export function AccordionItem({
  value,
  setValue,
  handleUpdate,
  handleToggle
}: Props): ReactElement {
  const {
    id,
    active,
    title,
    enableScript,
    type,
    scriptValue,
    linkValue,
    enableIconSelect,
    chatIcon
  } = value

  function handleChangeActive(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    handleToggle(id, event.target.checked)
  }

  function handleChangeType(
    event: React.MouseEvent<HTMLElement>,
    type: 'link' | 'script'
  ): void {
    setValue({
      ...value,
      type
    })
  }

  function handleChangeValue(event: React.ChangeEvent<HTMLInputElement>): void {
    if (enableScript === true && type === 'script') {
      setValue({
        ...value,
        scriptValue: event.target.value
      })
    } else {
      setValue({
        ...value,
        linkValue: event.target.value
      })
    }
  }

  function handleChangeIcon(event: SelectChangeEvent): void {
    setValue({
      ...value,
      chatIcon: findKey(
        ChatIcon,
        (value) => value === event.target.value
      ) as ChatIcon
    })
  }

  return (
    <Accordion disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 6 }}>
        <Checkbox
          checked={active}
          sx={{ pl: 0 }}
          onChange={handleChangeActive}
        />
        <Typography sx={{ my: 'auto' }}>{title}</Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 6 }}>
        <Stack direction="column" spacing={8} sx={{ pb: 4 }}>
          {enableScript === true && (
            <ToggleButtonGroup
              value={type}
              exclusive
              onChange={handleChangeType}
            >
              <ToggleButton value="link">Link</ToggleButton>
              <ToggleButton value="script">Widget</ToggleButton>
            </ToggleButtonGroup>
          )}

          <TextField
            variant="outlined"
            placeholder={
              enableScript === true && type === 'script'
                ? 'Past Page ID here'
                : 'Paste URL here'
            }
            value={
              enableScript === true && type === 'script'
                ? scriptValue
                : linkValue
            }
            onChange={handleChangeValue}
            onBlur={handleUpdate}
          />

          {enableIconSelect === true && (
            <FormControl fullWidth hiddenLabel>
              <Select value={chatIcon} displayEmpty onChange={handleChangeIcon}>
                <MenuItem value={ChatIcon.default}>Default</MenuItem>
                <MenuItem value={ChatIcon.snapChat}>SnapChat</MenuItem>
                <MenuItem value={ChatIcon.instagram}>Instagram</MenuItem>
              </Select>
            </FormControl>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
