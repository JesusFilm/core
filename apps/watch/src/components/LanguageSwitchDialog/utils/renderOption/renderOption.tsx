import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { RowComponentProps } from 'react-window'

export const renderOption = (props: RowComponentProps) => {
  const { data, index, style } = props
  const { t } = useTranslation()
  const item = data[index][1]
  const { key, ...optionProps } = data[index][0]

  // Handle header items
  if (item?.__type === 'header' || item?.type === 'header') {
    return (
      <ListItem
        key={item.id}
        style={style}
        sx={{
          display: 'block',
          cursor: 'default',
          paddingY: 2,
          paddingX: 2
        }}
        tabIndex={-1}
        aria-hidden="true"
      >
        <Typography
          variant="overline"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            fontSize: '0.75rem',
            letterSpacing: '0.08333em',
            textAlign: 'left',
            display: 'block',
            width: '100%'
          }}
        >
          {item.id === '__header_suggested__' ? t('Suggested') : ''}
        </Typography>
      </ListItem>
    )
  }

  // Handle divider items
  if (item?.__type === 'divider' || item?.type === 'divider') {
    return (
      <ListItem
        key={item.id}
        style={style}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'default',
          paddingTop: 0.5,
          paddingBottom: 0.5,
          paddingX: 0
        }}
        tabIndex={-1}
        aria-hidden="true"
      >
        <Divider
          sx={{
            marginX: 2,
            marginY: 0,
            borderColor: 'grey.300',
            borderWidth: 1,
            width: 'calc(100% - 32px)'
          }}
        />
      </ListItem>
    )
  }

  // Handle regular language options
  const { id, localName, nativeName } = item
  return (
    <ListItem
      {...optionProps}
      key={id}
      style={style}
      tabIndex={0}
      sx={{
        display: 'block',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'action.hover'
        }
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
