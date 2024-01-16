import Box from '@mui/material/Box'
import { ReactElement, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { ActionDetails } from '../../ActionDetails'
import { SocialShareAppearance } from '../../Drawer/SocialShareAppearance'
import { Properties } from '../../Properties'
import { CardItem } from '../CardItem'

interface JourneyEditContentComponentItemProps {
  children: ReactNode | ReactNode[]
  component: ActiveJourneyEditContent
}

export function JourneyEditContentComponentItem({
  children,
  component
}: JourneyEditContentComponentItemProps): ReactElement {
  const {
    dispatch,
    state: { journeyEditContentComponent }
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')

  function handleClick(): void {
    dispatch({
      type: 'SetJourneyEditContentAction',
      component
    })
    switch (component) {
      case ActiveJourneyEditContent.SocialPreview:
        dispatch({
          type: 'SetDrawerPropsAction',
          title: t('Social Share Preview'),
          children: <SocialShareAppearance />
        })
        break
      case ActiveJourneyEditContent.Action:
        dispatch({
          type: 'SetDrawerPropsAction',
          mobileOpen: true,
          title: t('Information'),
          children: <ActionDetails />
        })
        break
      case ActiveJourneyEditContent.JourneyFlow:
        dispatch({
          type: 'SetDrawerPropsAction',
          mobileOpen: true,
          title: t('Properties'),
          children: <Properties isPublisher={false} />
        })
        break
    }
  }

  return (
    <CardItem
      onClick={handleClick}
      selected={journeyEditContentComponent === component}
      sx={{ justifyContent: 'flex-end' }}
    >
      <Box
        sx={{
          p: 1,
          borderRadius: 2,
          width: 84,
          height: 84
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 1,
            backgroundColor: 'background.paper',
            width: '100%',
            height: '100%',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
          }}
        >
          {children}
        </Box>
      </Box>
    </CardItem>
  )
}
