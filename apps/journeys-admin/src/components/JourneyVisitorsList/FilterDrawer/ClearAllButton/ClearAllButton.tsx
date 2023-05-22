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
        border: 1,
        marginLeft: '20px',
        marginBottom: '3px',
        '&:hover': {
          backgroundColor: 'background.default'
        }
      }}
    >
      Clear all
    </Button>
  )
}
