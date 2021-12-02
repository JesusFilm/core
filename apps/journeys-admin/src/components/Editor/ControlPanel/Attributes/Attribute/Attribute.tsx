import { ReactElement } from 'react'
import {
  Box,
  Card as MuiCard,
  CardActionArea,
  CardContent,
  Typography,
  Grid
} from '@mui/material'

interface AttributeProps {
  icon: ReactElement
  name: string
  value: string
  description: string
}

export function Attribute({
  icon,
  name,
  value,
  description
}: AttributeProps): ReactElement {
  return (
    <Box
      sx={{
        maxWidth: 150
      }}
    >
      <MuiCard variant="outlined">
        <CardActionArea>
          <CardContent sx={{ py: 2, px: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item>{icon}</Grid>
              <Grid item sx={{ maxWidth: 92 }}>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {name}
                </Typography>
                <Typography noWrap>{value}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </CardActionArea>
      </MuiCard>
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
