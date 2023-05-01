import { ReactElement, ReactNode } from 'react'
import Box from '@mui/material/Box'

interface ExpandedCoverProps {
  children: ReactNode
  backgroundBlur?: string
}

export function ExpandedCover({
  children,
  backgroundBlur
}: ExpandedCoverProps): ReactElement {
  return (
    <Box
      data-testid="ExpandedCover"
      sx={{
        flexGrow: 1,
        overflow: 'auto',
        display: 'flex',
        padding: (theme) => ({
          xs: theme.spacing(7),
          sm: theme.spacing(7, 10),
          md: theme.spacing(10)
        }),
        justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          margin: 'auto',
          width: '100%',
          maxWidth: 500,
          zIndex: 1,
          '& > *': {
            '&:first-child': { mt: 0 },
            '&:last-child': { mb: 0 }
          }
        }}
      >
        {children}
      </Box>
      {backgroundBlur != null && (
        <Box
          data-testid="expandedBlurBackground"
          sx={{
            position: 'absolute',
            width: '100%',
            height: '110%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
            backgroundPosition: '0% 0%',
            left: 0,
            top: '-10%',
            zIndex: -1,
            transform: 'scaleY(-1)',
            backgroundBlendMode: 'hard-light',
            backgroundImage: `url(${backgroundBlur}), url(${backgroundBlur})`
          }}
        />
      )}
    </Box>
  )
}
