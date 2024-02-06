import AppBar from '@mui/material/AppBar'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { CardTemplateDrawer } from '../CardTemplateDrawer'
import { Attributes } from '../ControlPanel/Attributes'

interface DrawerContentProps {
  title?: string
  children?: ReactNode
}

function DrawerContent({ title, children }: DrawerContentProps): ReactElement {
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
        </Toolbar>
      </AppBar>
      {children}
    </>
  )
}

export function Drawer(): ReactElement {
  const {
    state: {
      drawerTitle: title,
      drawerChildren: children,
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
  switch (selectedComponent) {
    case 'Footer':
      blockTitle = t('Footer Properties')
      break
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

  return (
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
      <DrawerContent title={blockTitle}>
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
  )
}
