import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import { ReactElement } from 'react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'
import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'

interface LargeProps {
  loading?: boolean
  imageBlock?: { src: string | null; alt: string } | null
  onClick?: () => void
}

export function Large({
  loading,
  imageBlock,
  onClick
}: LargeProps): ReactElement {
  return (
    <Box
      overflow="hidden"
      display="flex"
      justifyContent="center"
      alignItems="center"
      position="relative"
      borderRadius={2}
      width="100%"
      height={194}
      mb={6}
      bgcolor="#EFEFEF"
      sx={{
        cursor: 'pointer',
        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.1)' },
        '&:active:hover': { bgcolor: 'rgba(0, 0, 0, 0.2)' }
      }}
      data-testid="image-edit"
      onClick={onClick}
    >
      {loading === true ? (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={194}
          sx={{
            borderRadius: 2,
            root: { '&:hover': { backgroundColor: 'yellow' } }
          }}
        />
      ) : imageBlock?.src != null ? (
        <Box
          component="img"
          src={imageBlock.src}
          alt={imageBlock.alt}
          sx={{
            width: '100%',
            height: '194px',
            objectFit: 'cover'
          }}
        />
      ) : (
        <GridEmptyIcon fontSize="large" />
      )}
      <IconButton
        size="small"
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 10,
          borderRadius: 4,
          backgroundColor: 'background.paper'
        }}
      >
        <Edit2Icon fontSize="small" sx={{ color: 'secondary.dark' }} />
      </IconButton>
    </Box>
  )
}
