import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import { Dispatch, ReactElement, SetStateAction, useState } from 'react'

interface ShowMoreButtonProps {
  displayMore: boolean
  setDisplayMore: Dispatch<SetStateAction<boolean>>
}

interface VideoDescriptionProps {
  videoDescription: string
}

export const ShowMoreButton = ({
  displayMore,
  setDisplayMore
}: ShowMoreButtonProps): ReactElement => {
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

export const VideoDescription = ({
  videoDescription
}: VideoDescriptionProps): ReactElement => {
  const [displayMore, setDisplayMore] = useState(false)

  const videoDescriptionMaxLength = 139
  return (
    <Box
      sx={{
        height:
          !displayMore && videoDescription.length > videoDescriptionMaxLength
            ? '70px'
            : 'auto',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Typography
        variant="caption"
        sx={{
          position: 'relative'
        }}
      >
        {videoDescription}
        {videoDescription.length > videoDescriptionMaxLength && displayMore && (
          <ShowMoreButton
            displayMore={displayMore}
            setDisplayMore={setDisplayMore}
          />
        )}
      </Typography>
      {videoDescription.length > videoDescriptionMaxLength && !displayMore && (
        <ShowMoreButton
          displayMore={displayMore}
          setDisplayMore={setDisplayMore}
        />
      )}
    </Box>
  )
}
