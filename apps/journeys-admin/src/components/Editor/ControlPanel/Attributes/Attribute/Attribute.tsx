import { ReactElement, useContext } from 'react'
import {
  Box,
  Card as MuiCard,
  CardActionArea,
  CardContent,
  Typography,
  Stack,
  Divider
} from '@mui/material'
import { EditorContext } from '../../../Context'

interface AttributeProps {
  id: string
  icon: ReactElement
  name: string
  value: string
  description: string
  onClick?: () => void
}

export function Attribute({
  id,
  icon,
  name,
  value,
  description,
  onClick
}: AttributeProps): ReactElement {
  const {
    state: { selectedAttributeId },
    dispatch
  } = useContext(EditorContext)

  const handleClick = (): void => {
    dispatch({ type: 'SetSelectedAttributeIdAction', id })
    onClick?.()
  }

  return (
    <Box
      data-testid={id}
      sx={{
        maxWidth: 150
      }}
    >
      <MuiCard
        variant="outlined"
        sx={{
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: 0,
          borderBottom: 0
        }}
      >
        <CardActionArea onClick={handleClick}>
          <CardContent sx={{ py: 2, px: 4 }}>
            <Stack spacing={3} alignItems="center" direction="row">
              {icon}
              <Box sx={{ maxWidth: 92 }}>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {name}
                </Typography>
                <Typography noWrap>{value}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </CardActionArea>
      </MuiCard>
      <Divider
        color="primary"
        sx={{
          transition: '0.2s border-color ease-out',
          borderBottomWidth: 2,
          borderColor: (theme) =>
            selectedAttributeId === id
              ? theme.palette.primary.main
              : theme.palette.divider
        }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        align="center"
        noWrap
        component="div"
        sx={{ pt: 1 }}
      >
        {description}
      </Typography>
    </Box>
  )
}
