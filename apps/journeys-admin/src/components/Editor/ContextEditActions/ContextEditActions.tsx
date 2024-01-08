import { gql, useMutation, useQuery } from '@apollo/client'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import TranslateIcon from '@mui/icons-material/Translate'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { GetRole } from '../../../../__generated__/GetRole'
import {
  JourneyStatus,
  Role,
  UserJourneyRole
} from '../../../../__generated__/globalTypes'
import { AccessAvatars } from '../../AccessAvatars'
import { DuplicateBlock } from '../../DuplicateBlock'
import { MoveBlockButtons } from '../ControlPanel/Attributes/MoveBlockButtons'

import { DeleteBlock } from './DeleteBlock'
import { Menu } from './Menu'

export const GET_ROLE = gql`
  query GetRole {
    getUserRole {
      id
      userId
      roles
    }
  }
`

const DynamicLanguageDialog = dynamic<{
  open: boolean
  onClose: () => void
}>(
  async () =>
    await import(
      /* webpackChunkName: "MenuLanguageDialog" */
      '../../JourneyView/Menu/LanguageDialog'
    ).then((mod) => mod.LanguageDialog)
)

export function ContextEditActions(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { state } = useEditor()
  const { data } = useQuery<GetRole>(GET_ROLE)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)
  const [showLanguageDialog, setShowLanguageDialog] = useState(false)

  const handleUpdateLanguage = (): void => {
    setShowLanguageDialog(true)
    setAnchorEl(null)
  }

  const {
    state: {
      steps,
      selectedBlock,
      selectedComponent,
      selectedStep,
      activeTab,
      journeyEditContentComponent
    },
    dispatch
  } = useEditor()

  return (
    <Stack spacing={4} direction="column" alignItems="center" sx={{
      position:'absolute',
      left: '300px',
      bottom: '200px',
      zIndex: 99
    }}>
      <DuplicateBlock
        variant="button"
        disabled={
          state.journeyEditContentComponent !== ActiveJourneyEditContent.Canvas
        }
      />

      <DeleteBlock
        variant="button"
        disabled={
          state.journeyEditContentComponent !== ActiveJourneyEditContent.Canvas
        }
      />

      <Divider flexItem  orientation='horizontal' variant="middle"/>

      { (selectedBlock != null) && <MoveBlockButtons selectedBlock={selectedBlock} selectedStep={selectedStep} />}
      {/* <Menu /> */}
    </Stack>
  )
}
