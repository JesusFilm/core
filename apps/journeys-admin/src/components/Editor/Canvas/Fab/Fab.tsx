import MuiFab, { FabProps } from '@mui/material/Fab'
import { Theme } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Zoom from '@mui/material/Zoom'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../__generated__/GetJourney'
import { DRAWER_WIDTH } from '../../constants'

interface FabProp {
  visible?: boolean
}

export function Fab({ visible = true }: FabProp): ReactElement {
  const {
    state: { activeFab, selectedStep, steps, journeyEditContentComponent },
    dispatch
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  function handleClick(): void {
    dispatch({
      type: 'SetActiveTabAction',
      activeTab: ActiveTab.Blocks
    })
  }

  function handleEditFab(): void {
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Save })
  }
  function handleSaveFab(): void {
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Edit })
  }

  const cardBlock = selectedStep?.children.find(
    (block) => block.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  const disabled =
    steps == null ||
    cardBlock?.children?.find(
      (block) =>
        block.__typename === 'VideoBlock' && cardBlock.coverBlockId !== block.id
    ) != null

  const fabProps: FabProps = {
    variant: smUp ? 'extended' : 'circular',
    size: 'large',
    color: 'primary',
    disabled,
    sx: {
      position: 'absolute',
      bottom: { xs: 16, sm: 73 },
      right: { xs: 16, sm: DRAWER_WIDTH + 84 }
    }
  }

  return (
    <Tooltip
      title={
        <Typography
          display={{
            xs: 'none',
            sm: 'flex'
          }}
          variant="caption"
          lineHeight="12px"
        >
          {t('Blocks cannot be placed on top of Video Block')}
        </Typography>
      }
      placement="top"
      arrow
    >
      <Zoom
        in={
          visible &&
          journeyEditContentComponent === ActiveJourneyEditContent.Canvas
        }
        unmountOnExit
        data-testid="Fab"
      >
        {activeFab === ActiveFab.Add ? (
          <MuiFab {...fabProps} onClick={handleClick}>
            <Plus2Icon sx={{ mr: smUp ? 3 : 0 }} />
            {smUp ? t('Add') : ''}
          </MuiFab>
        ) : activeFab === ActiveFab.Edit ? (
          <MuiFab {...fabProps} onClick={handleEditFab}>
            <Edit2Icon sx={{ mr: smUp ? 3 : 0 }} />
            {smUp ? t('Edit') : ''}
          </MuiFab>
        ) : (
          <MuiFab {...fabProps} onClick={handleSaveFab}>
            <CheckContainedIcon sx={{ mr: smUp ? 3 : 0 }} />
            {smUp ? t('Done') : ''}
          </MuiFab>
        )}
      </Zoom>
    </Tooltip>
  )
}
