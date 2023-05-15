import { Dispatch, ReactElement, SetStateAction } from 'react'
import Button from '@mui/material/Button'

interface VideoDescriptionProps {
  displayMore: boolean
  setDisplayMore: Dispatch<SetStateAction<boolean>>
}

export const VideoDescription = ({
  displayMore,
  setDisplayMore
}: VideoDescriptionProps): ReactElement => {
  return (
    <Button
      disableRipple
      variant="text"
      size="small"
      sx={{
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.93) 17%, rgba(255,255,255,1) 29%)',
        color: 'secondary.light',
        position: displayMore ? 'relative' : 'absolute',
        bottom: displayMore ? 1.7 : -6,
        right: displayMore ? 0 : -4,
        '&:hover': {
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.93) 17%, rgba(255,255,255,1) 29%)'
        }
      }}
      onClick={() => setDisplayMore(!displayMore)}
    >
      {displayMore ? 'Less' : 'More'}
    </Button>
  )
}
