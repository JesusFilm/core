import Button from '@mui/material/Button'
import { SxProps } from '@mui/material/styles'
import { MouseEvent, ReactElement } from 'react'

import Home3 from '@core/shared/ui/icons/Home3'
import Map3 from '@core/shared/ui/icons/Map3'

interface MapButtonProps {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void
  sx: SxProps
}

export function MapButton({ onClick, sx }: MapButtonProps): ReactElement {
  return (
    <Button
      variant="outlined"
      color="secondary"
      onClick={onClick}
      sx={{
        ...sx,
        px: 3,
        py: 3,
        minWidth: 0,
        minHeight: 0,
        bgcolor: 'background.paper'
      }}
    >
      <Map3 />
      {/* <Home3 /> */}
    </Button>
  )
}
