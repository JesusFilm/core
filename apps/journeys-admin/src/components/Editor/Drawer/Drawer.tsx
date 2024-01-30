import AppBar from '@mui/material/AppBar'
import MuiDrawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import { Theme, useTheme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import X2Icon from '@core/shared/ui/icons/X2'

import { CardTemplateDrawer } from '../CardTemplateDrawer'
import { Attributes } from '../ControlPanel/Attributes'

interface DrawerContentProps {
  title?: string
  children?: ReactNode
  handleDrawerToggle: () => void
}

function DrawerContent({
  title,
  children,
  handleDrawerToggle
}: DrawerContentProps): ReactElement {
  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography
            variant="subtitle1"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
            data-testid="drawer-title"
          >
            {title}
          </Typography>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            edge="end"
          >
            <X2Icon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {children}
    </>
  )
}

export function Drawer(): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const {
    state: {
      drawerTitle: title,
      drawerChildren: children,
      drawerMobileOpen: mobileOpen,
      selectedComponent,
      selectedBlock,
      selectedStep,
      journeyEditContentComponent
    },
    dispatch
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const selected = selectedComponent ?? selectedBlock ?? 'none'
  let blockTitle: string | undefined
  switch (selectedBlock?.__typename) {
    case 'ButtonBlock':
      blockTitle = t('Button Properties')
      break
    case 'FormBlock':
      blockTitle = t('Form Properties')
      break
    case 'ImageBlock':
      blockTitle = t('Image Properties')
      break
    case 'RadioQuestionBlock':
      blockTitle = t('Poll Properties')
      break
    case 'RadioOptionBlock':
      blockTitle = t('Poll Option Properties')
      break
    case 'SignUpBlock':
      blockTitle = t('Subscribe Properties')
      break
    case 'StepBlock':
      if (selectedBlock.children[0]?.children.length > 0) {
        blockTitle = t('Card Properties')
      } else {
        blockTitle = t('Card Templates')
      }
      break
    case 'TextResponseBlock':
      blockTitle = t('Feedback Properties')
      break
    case 'TypographyBlock':
      blockTitle = t('Typography Properties')
      break
    case 'VideoBlock':
      blockTitle = t('Video Properties')
      break
    default:
      blockTitle = title
  }
  switch (journeyEditContentComponent) {
    case ActiveJourneyEditContent.SocialPreview:
      blockTitle = t('Social Share Preview')
      break
    case ActiveJourneyEditContent.Action:
      blockTitle = t('Information')
      break
    case ActiveJourneyEditContent.JourneyFlow:
      blockTitle = t('Properties')
      break
  }
  const { zIndex } = useTheme()

  const handleDrawerToggle = (): void => {
    dispatch({
      type: 'SetDrawerMobileOpenAction',
      mobileOpen: !mobileOpen
    })
  }

  return smUp ? (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        border: 1,
        borderColor: 'divider',
        borderRadius: 0,
        overflow: 'hidden',
        height: '100%',
        width: '100%',
        minWidth: 0
      }}
      data-testid="EditorDrawer"
    >
      <DrawerContent title={blockTitle} handleDrawerToggle={handleDrawerToggle}>
        {journeyEditContentComponent === ActiveJourneyEditContent.Canvas
          ? selected !== 'none' &&
            selectedStep !== undefined &&
            (selectedStep.children[0]?.children.length > 0 ? (
              <Attributes selected={selected} step={selectedStep} />
            ) : (
              <CardTemplateDrawer />
            ))
          : children}
      </DrawerContent>
    </Paper>
  ) : (
    <>
      <MuiDrawer
        anchor="bottom"
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          zIndex: zIndex.modal
        }}
        data-testid="EditorDrawer"
      >
        <DrawerContent title={title} handleDrawerToggle={handleDrawerToggle}>
          {children}
        </DrawerContent>
      </MuiDrawer>
    </>
  )
}
