// import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
// import { ReactElement } from 'react'

// export function HoverMenu(): ReactElement {
//   return (
//     <ArrowDownwardRoundedIcon
//       className="show-on-hover"
//       style={{
//         display: 'flex',
//         position: 'absolute',
//         borderRadius: '50%',
//         color: 'white',
//         fontSize: 'large',
//         top: 0,
//         //  right: 0,
//         backgroundColor: '#c52d3aff',
//         left: '100%',
//         transform: 'translate(-50%, 0)'
//       }}
//     />
//   )
// }

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import { MouseEvent, ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import MoreIcon from '@core/shared/ui/icons/More'

import { DeleteBlock } from '../../../../Content/Canvas/QuickControls/DeleteBlock'
import { DuplicateBlock } from '../../../../Content/Canvas/QuickControls/DuplicateBlock'

interface HoverMenuProps {
  handleClick: () => void
}

export function HoverMenu({ handleClick }: HoverMenuProps): ReactElement {
  const {
    state: { selectedBlock },
    dispatch
  } = useEditor()
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function handleShowMenu(event: MouseEvent<HTMLElement>): void {
    // handleClick()
    setAnchorEl(event.currentTarget)
  }
  function handleCloseMenu(): void {
    setAnchorEl(null)
  }

  return (
    <>
      <Box
        // className={className}
        sx={{
          display: 'flex',
          position: 'absolute',
          borderRadius: '50%',
          color: 'white',
          fontSize: 'large',
          top: 0,
          //  right: 0,
          // backgroundColor: '#c52d3aff',
          left: '100%',
          transform: 'translate(-50%, 0)'
        }}
      >
        <IconButton
          id="edit-journey-actions"
          edge="end"
          aria-label={t('Edit Journey Actions')}
          aria-controls="edit-journey-actions"
          aria-haspopup="true"
          aria-expanded={anchorEl != null ? 'true' : undefined}
          onClick={handleShowMenu}
          disabled={journey == null}
        >
          <MoreIcon />
        </IconButton>
        <MuiMenu
          id="edit-journey-actions"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          MenuListProps={{
            'aria-labelledby': 'edit-journey-actions'
          }}
        >
          <DuplicateBlock
            variant="list-item"
            disabled={selectedBlock?.__typename === 'VideoBlock'}
            handleClick={handleCloseMenu}
          />
          <DeleteBlock variant="list-item" closeMenu={handleCloseMenu} />
        </MuiMenu>
      </Box>
    </>
  )
}
