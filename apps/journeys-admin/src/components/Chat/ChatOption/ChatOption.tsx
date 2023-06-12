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
import { Platform } from '../utils/types' // TODO: replace with generated type

export interface PlatformDetails {
  id: string
  title: string
  linkValue: string
  active: boolean
  chatIcon: Platform
  enableScript?: boolean
  type?: 'link' | 'script'
  scriptValue: string
  enableIconSelect?: boolean
}

interface Props {
  value: PlatformDetails
  setValue: (value: PlatformDetails) => void
  handleUpdate: () => void
  handleToggle: (id: string, checked: boolean) => void
}
export function ChatOption({
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
        Platform,
        (value) => value === event.target.value
      ) as Platform
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
                <MenuItem value={Platform.default}>Default</MenuItem>
                <MenuItem value={Platform.website}>Website</MenuItem>
                <MenuItem value={Platform.mail}>Mail</MenuItem>
                <MenuItem value={Platform.viber}>Viber</MenuItem>
                <MenuItem value={Platform.vk}>VK</MenuItem>
                <MenuItem value={Platform.weChat}>WeChat</MenuItem>
                <MenuItem value={Platform.snapchat}>Snapchat</MenuItem>
                <MenuItem value={Platform.instagram}>Instagram</MenuItem>
              </Select>
            </FormControl>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
