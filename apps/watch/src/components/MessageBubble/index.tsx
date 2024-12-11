import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import RefreshIcon from '@mui/icons-material/Refresh'
import Stack from '@mui/material/Stack'
import { type ReactElement, useState } from 'react'
import { LikeAnimation } from '../LikeAnimation'

interface MessageBubbleProps {
  message: string[]
}

export function MessageBubble({ message }: MessageBubbleProps): ReactElement {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showLikeAnimation, setShowLikeAnimation] = useState(false)

  const handleRefresh = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % message.length)
  }

  const handleLike = () => {
    setShowLikeAnimation(true)
    setTimeout(() => {
      setShowLikeAnimation(false)
    }, 1000)
  }

  return (
    <Box
      sx={{
        position: 'relative',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '16px 24px 24px',
        mt: -2,
        marginBottom: '2rem',
        width: '100%',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-10px',
          left: '20px',
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: '10px solid rgba(255, 255, 255, 0.08)'
        }
      }}
    >
      {showLikeAnimation && <LikeAnimation />}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography
          variant="subtitle1"
          color="text.primary"
          sx={{ opacity: 0.5 }}
        >
          Sharing idea for chat
        </Typography>
        <Chip
          icon={<RefreshIcon sx={{ fontSize: '14px' }} />}
          label="refresh"
          variant="outlined"
          size="small"
          clickable
          onClick={handleRefresh}
          sx={{
            '& .MuiChip-label': { px: 2 },
            '& .MuiChip-icon': { ml: 2 },
            borderColor: 'rgba(255, 255, 255, 0.2)',
            opacity: 0.5,
            '&:hover': {
              opacity: 1
            }
          }}
        />
      </Stack>
      <Typography
        variant="body2"
        color="text.primary"
        sx={{ opacity: 0.9, marginBottom: 2 }}
      >
        {message[currentIndex]}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="space-between"
        sx={{ pt: 2 }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
        >
          <Chip
            icon={<ThumbUpIcon sx={{ fontSize: '14px' }} />}
            variant="outlined"
            clickable
            onClick={handleLike}
            sx={{
              '& .MuiChip-icon': { ml: 4 }
            }}
          />
          <Chip
            icon={<ThumbDownIcon sx={{ fontSize: '14px' }} />}
            label="Not Relevant"
            variant="outlined"
            clickable
            sx={{
              '& .MuiChip-label': { px: 3 },
              '& .MuiChip-icon': { ml: 2.5 }
            }}
          />
        </Stack>
        <Chip
          icon={<ContentCopyIcon sx={{ fontSize: '14px' }} />}
          label="Copy"
          variant="filled"
          clickable
          sx={{
            '& .MuiChip-label': { px: 3 },
            '& .MuiChip-icon': { ml: 2.5, color: 'black' },
            bgcolor: 'white',
            color: 'black',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.9)'
            }
          }}
        />
      </Stack>
    </Box>
  )
}
