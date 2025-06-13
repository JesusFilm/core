import Box from '@mui/material/Box'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import { ListChildComponentProps } from 'react-window'

export const renderOption = (props: ListChildComponentProps) => {
  const { data, index, style } = props
  const { id, localName, nativeName } = data[index][1]
  const { key, ...optionProps } = data[index][0]
  return (
    <ListItem
      {...optionProps}
      key={id}
      style={style}
      tabIndex={1}
      sx={{
        display: 'block',
        cursor: 'pointer'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}
      >
        <Typography variant="h6">{localName ?? nativeName}</Typography>
        {localName != null &&
          nativeName != null &&
          nativeName !== localName && (
            <Typography variant="body2" color="text.secondary">
              {nativeName}
            </Typography>
          )}
      </Box>
    </ListItem>
  )
}
