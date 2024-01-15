import Box from '@mui/material/Box'
import { ReactElement, ReactNode } from 'react'

import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'

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

  function handleClick(): void {
    dispatch({
      type: 'SetJourneyEditContentAction',
      component
    })
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
