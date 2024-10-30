import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'
import { ListChildComponentProps } from 'react-window'

export function defaultRenderOption(props: ListChildComponentProps): ReactNode {
  const { data, index, style } = props
  const { id, localName, nativeName } = data[index][1]
  const { key, ...optionProps } = data[index][0]

  return (
    <Box {...optionProps} key={id} style={style} tabIndex={1} component="li">
      <Stack>
        <Typography>{localName ?? nativeName}</Typography>
        {localName != null && nativeName != null && (
          <Typography variant="body2" color="text.secondary">
            {nativeName}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}