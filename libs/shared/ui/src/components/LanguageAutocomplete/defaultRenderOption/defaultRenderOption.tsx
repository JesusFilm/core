import ListItem from '@mui/material/ListItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'
import type { RowComponentProps } from 'react-window'

export function defaultRenderOption(
  props: RowComponentProps<{ rows: any[] }>
): ReactNode {
  const { rows, index, style } = props
  const { id, localName, nativeName } = rows[index][1]
  const { key, ownerState, ariaAttributes, ...optionProps } = rows[index][0]

  return (
    <ListItem
      {...optionProps}
      key={id}
      style={style}
      tabIndex={1}
      sx={{ cursor: 'pointer' }}
    >
      <Stack>
        <Typography>{localName ?? nativeName}</Typography>
        {localName != null && nativeName != null && (
          <Typography variant="body2" color="text.secondary">
            {nativeName}
          </Typography>
        )}
      </Stack>
    </ListItem>
  )
}
