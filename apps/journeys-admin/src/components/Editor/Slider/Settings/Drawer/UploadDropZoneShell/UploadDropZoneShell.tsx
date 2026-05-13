import Box, { BoxProps } from '@mui/material/Box'
import { ReactElement } from 'react'

interface UploadDropZoneShellProps extends BoxProps {
  isDragAccept: boolean
  isActive: boolean
  hasError: boolean
}

export function UploadDropZoneShell({
  isDragAccept,
  isActive,
  hasError,
  children,
  sx,
  ...rest
}: UploadDropZoneShellProps): ReactElement {
  const noBorder = isActive || hasError
  return (
    <Box
      sx={{
        mt: 3,
        display: 'flex',
        width: '100%',
        minHeight: { xs: 0, sm: 162 },
        borderWidth: { xs: 0, sm: noBorder ? 0 : 2 },
        backgroundColor: {
          xs: 'transparent',
          sm:
            isDragAccept || isActive
              ? 'rgba(239, 239, 239, 0.9)'
              : hasError
                ? 'rgba(197, 45, 58, 0.08)'
                : 'rgba(239, 239, 239, 0.35)'
        },
        borderColor: 'divider',
        borderStyle: { xs: 'none', sm: noBorder ? 'none' : 'dashed' },
        borderRadius: 2,
        px: { xs: 0, sm: 3 },
        py: { xs: 0, sm: 4 },
        gap: 2,
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        ...sx
      }}
      {...rest}
    >
      {children}
    </Box>
  )
}
