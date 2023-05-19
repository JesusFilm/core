import { ReactElement } from 'react'
import Button from '@mui/material/Button'

interface ClearAllProps {
  handleClearAll?: () => void
}

export const ClearAllButton = ({
  handleClearAll
}: ClearAllProps): ReactElement => {
  return (
    <Button
      onClick={handleClearAll}
      sx={{
        backgroundColor: 'background.paper',
        color: 'secondary.light',
        marginLeft: '20px',
        marginBottom: '3px',
        '&:hover': {
          backgroundColor: 'background.default'
        }
      }}
    >
      Clear All
    </Button>
  )
}
