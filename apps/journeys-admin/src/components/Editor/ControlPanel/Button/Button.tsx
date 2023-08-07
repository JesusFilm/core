import Box from '@mui/material/Box'
import MuiCard from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface ButtonProps {
  icon: ReactElement
  name?: string
  value: string
  description?: string
  selected?: boolean
  onClick?: () => void
}

export function Button({
  icon,
  name,
  value,
  description,
  selected,
  onClick
}: ButtonProps): ReactElement {
  const handleClick = (): void => {
    onClick?.()
  }

  return (
    <Box
      sx={{
        maxWidth: 150
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <MuiCard
        variant="outlined"
        sx={{
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: 0,
          borderBottom: 0
        }}
      >
        <CardActionArea onClick={handleClick} sx={{ minHeight: 60 }}>
          <CardContent sx={{ py: 2, px: 4 }}>
            <Stack spacing={3} alignItems="center" direction="row">
              {icon}
              <Box sx={{ maxWidth: 92, overflow: 'hidden' }}>
                {name != null && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {name}
                  </Typography>
                )}
                <Typography noWrap>{value !== '' ? value : 'None'}</Typography>
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
            selected === true
              ? theme.palette.primary.main
              : theme.palette.divider
        }}
      />
      <Box sx={{ height: 24 }}>
        {description != null && (
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
        )}
      </Box>
    </Box>
  )
}
