import Button from '@mui/material/Button'
import { ReactElement } from 'react'

interface ClearAllProps {
  handleClearAll?: () => void
}

export const ClearAllButton = ({
  handleClearAll
}: ClearAllProps): ReactElement => {
  return (
    <Button
      variant="outlined"
      color="secondary"
      size="small"
      onClick={handleClearAll}
      sx={{
        ml: 5,
        mb: 1
      }}
      data-testid="ClearAllButton"
    >
      Clear all
    </Button>
  )
}
