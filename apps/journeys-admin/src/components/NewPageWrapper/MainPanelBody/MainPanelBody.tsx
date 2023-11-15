import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

import { usePageWrapperStyles } from '../utils/usePageWrapperStyles'

export interface MainPanelBodyProps {
  children: ReactNode
  bottomPanelChildren?: ReactNode
  sx?: SxProps
}

export function MainPanelBody({
  children,
  bottomPanelChildren,
  sx
}: MainPanelBodyProps): ReactElement {
  const { navbar, bottomPanel } = usePageWrapperStyles()

  return (
    <Stack
      flexGrow={1}
      border="hidden"
      sx={{
        overflow: 'none',
        overflowY: { md: 'auto' },
        width: 'inherit'
      }}
      data-testid="MainPanelBody"
    >
      {/* MainBody */}
      <Stack
        data-testid="main-body"
        flexGrow={1}
        sx={{
          px: { xs: 6, md: 8 },
          py: { xs: 6, md: 9 },
          mb: {
            xs: 0,
            md: bottomPanelChildren != null ? bottomPanel.height : 0
          },
          ...sx
        }}
      >
        {children}
      </Stack>

      {/* BottomPanel */}
      {bottomPanelChildren != null && (
        <Stack
          data-testid="bottom-panel"
          flexShrink={0}
          sx={{
            width: 'inherit',
            height: bottomPanel.height,
            position: 'fixed',
            bottom: 0,
            left: { xs: 0, md: navbar.width },
            backgroundColor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          {bottomPanelChildren}
        </Stack>
      )}
    </Stack>
  )
}
