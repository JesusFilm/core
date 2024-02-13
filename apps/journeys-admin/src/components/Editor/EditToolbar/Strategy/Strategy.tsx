import Button from '@mui/material/Button'
import { ReactElement } from 'react'

import BulbIcon from '@core/shared/ui/icons/Bulb'

export function Strategy(): ReactElement {
  return (
    <Button
      variant="outlined"
      color="secondary"
      startIcon={<BulbIcon />}
      sx={{
        display: {
          xs: 'none',
          md: 'flex'
        }
      }}
      onClick={handleGoalsClick}
    >
      <Typography variant="subtitle2" sx={{ py: 1 }}>
        {t('Strategy')}
      </Typography>
    </Button>
  )
}
