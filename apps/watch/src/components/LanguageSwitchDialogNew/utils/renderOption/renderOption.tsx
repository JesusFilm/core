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
      <Typography variant="h6">{localName ?? nativeName}</Typography>
      {localName != null && nativeName != null && (
        <Typography variant="body2" color="text.secondary">
          {nativeName}
        </Typography>
      )}
    </ListItem>
  )
}
