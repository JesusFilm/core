import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { SxProps } from '@mui/system'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

interface OrderSelectProps {
  idx: number
  total: number
  onUpdate: (newOrder: number) => void
  slotProps?: {
    formControl?: {
      sx?: SxProps
    }
  }
}

export function OrderSelect({
  idx,
  total,
  onUpdate,
  slotProps
}: OrderSelectProps): ReactElement {
  const t = useTranslations()

  const handleChange = (e: SelectChangeEvent<number>): void => {
    let newOrder = e.target.value

    if (typeof newOrder === 'string') {
      newOrder = Number(newOrder)
    }

    if (typeof newOrder !== 'number') return

    onUpdate(newOrder)
  }

  return (
    <FormControl sx={{ ...slotProps?.formControl?.sx, minWidth: 64 }}>
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
