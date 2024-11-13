import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

interface DropdownProps {
  id: string
  idx: number
  total: number
  onChange: (input: { id: string; order: number }) => void
}

export function DropDown({
  id,
  idx,
  total,
  onChange
}: DropdownProps): ReactElement {
  const t = useTranslations()
  function handleChange(e: SelectChangeEvent<number>): void {
    let newOrder = e.target.value
    if (typeof newOrder === 'string') {
      newOrder = Number(newOrder)
    }
    if (typeof newOrder !== 'number') return
    onChange({ id, order: newOrder })
  }

  return (
    <FormControl sx={{ ml: 'auto' }}>
      <InputLabel>{t('Order')}</InputLabel>
      <Select value={idx + 1} size="small" onChange={handleChange}>
        {[...Array(total)].map((_, i) => (
          <MenuItem key={i} value={i + 1}>
            <Typography>{i + 1}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
