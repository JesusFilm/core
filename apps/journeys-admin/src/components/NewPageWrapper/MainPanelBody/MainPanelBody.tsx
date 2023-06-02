import { ReactElement, ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { usePageWrapperStyles } from '../utils/usePageWrapperStyles'

export interface MainPanelBodyProps {
  children: ReactNode
  bottomPanelChildren?: ReactNode
  isEdit?: boolean
}

export function MainPanelBody({
  children,
  bottomPanelChildren,
  isEdit
}: MainPanelBodyProps): ReactElement {
  const { navbar, bottomPanel } = usePageWrapperStyles()

  return (
    <Stack
      flexGrow={1}
      border="hidden"
      sx={{
        overflow: 'none',
        overflowY: { sm: 'auto' },
        width: 'inherit'
      }}
    >
      {/* MainBody */}
      <Stack
        data-testid="main-body"
        flexGrow={1}
        sx={{
          // Make optional or remove during cooldown
          // backgroundColor: 'background.paper',
          px: { xs: isEdit != null ? 0 : 6, sm: isEdit != null ? 0 : 8 },
          py: { xs: isEdit != null ? 0 : 6, sm: isEdit != null ? 0 : 9 },
          mb: bottomPanelChildren != null ? bottomPanel.height : 0
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
            left: { xs: 0, sm: navbar.width },
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
