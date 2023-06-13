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
import FormControl from '@mui/material/FormControl'
import Checkbox from '@mui/material/Checkbox'
import Stack from '@mui/material/Stack'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import findKey from 'lodash/findKey'
import { Platform } from '../utils/types' // TODO: replace with generated type
import { HelperInfo } from '../HelperInfo'

export interface PlatformDetails {
  id: string
  title: string
  linkValue?: string
  active: boolean
  chatIcon?: Platform
  enableIconSelect?: boolean
  helperInfo?: string
}

interface Props {
  value: PlatformDetails
  disableSelection: boolean
  setValue: (value: PlatformDetails) => void
  handleUpdate: () => void
  handleToggle: (id: string, checked: boolean) => void
}
export function ChatOption({
  value,
  disableSelection,
  setValue,
  handleUpdate,
  handleToggle
}: Props): ReactElement {
  const {
    id,
    active,
    title,
    linkValue,
    enableIconSelect,
    chatIcon,
    helperInfo
  } = value

  function handleChangeActive(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    handleToggle(id, event.target.checked)
  }

  function handleChangeValue(event: React.ChangeEvent<HTMLInputElement>): void {
    setValue({
      ...value,
      linkValue: event.target.value
    })
  }

  function handleChangeIcon(event: SelectChangeEvent): void {
    const icon = findKey(
      Platform,
      (value) => value === event.target.value
    ) as Platform

    if (icon != null) {
      setValue({
        ...value,
        chatIcon: icon
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
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 6 }}>
        <Checkbox
          checked={active}
          sx={{ pl: 0 }}
          disabled={disableSelection && !active}
          onChange={handleChangeActive}
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
                value={chatIcon ?? 'default'}
                displayEmpty
                onChange={handleChangeIcon}
                IconComponent={KeyboardArrowDownRoundedIcon}
              >
                <MenuItem value="default">Select an icon...</MenuItem>
                <MenuItem value={Platform.instagram}>Instagram</MenuItem>
                <MenuItem value={Platform.line}>LINE</MenuItem>
                <MenuItem value={Platform.skype}>Skype</MenuItem>
                <MenuItem value={Platform.snapchat}>SnapChat</MenuItem>
                <MenuItem value={Platform.tikTok}>TikTok</MenuItem>
                <MenuItem value={Platform.viber}>Viber</MenuItem>
                <MenuItem value={Platform.vk}>VK</MenuItem>
              </Select>
            </FormControl>
          )}

          <TextField
            variant="filled"
            placeholder="Paste URL here"
            value={linkValue}
            label="Link"
            onChange={handleChangeValue}
            onBlur={handleUpdate}
          />

          {helperInfo != null && <HelperInfo value={helperInfo} />}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
