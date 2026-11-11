import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement } from 'react'

import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { useCampaignEditor } from '../../CampaignEditorProvider'
import { ADMIN_PRIMARY } from '../hoverOutline'

interface CanvasInsertPointProps {
  pageId: string
  /** The position among the page's sections a section added here takes. */
  parentOrder: number
}

/**
 * The "+" between two sections (and above the first, below the last): a hover
 * zone straddling the seam, taking no layout height. Clicking it opens the
 * Add Panel with this insert point preset, so the next section type chosen
 * lands here.
 */
export function CanvasInsertPoint({
  pageId,
  parentOrder
}: CanvasInsertPointProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useCampaignEditor()

  function handleClick(event: MouseEvent<HTMLElement>): void {
    event.stopPropagation()
    dispatch({
      type: 'OpenAddPanelAction',
      preset: { pageId, parentOrder }
    })
  }

  return (
    <Box
      data-testid={`CanvasInsertPoint-${parentOrder}`}
      sx={{ position: 'relative', height: 0, zIndex: 3 }}
    >
      <Box
        onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
        sx={{
          position: 'absolute',
          insetInline: 0,
          top: -16,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& > *': { opacity: 0 },
          '&:hover > *, &:focus-within > *': { opacity: 1 }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            insetInline: 0,
            height: 2,
            bgcolor: ADMIN_PRIMARY.main
          }}
        />
        <IconButton
          aria-label={t('Add section here')}
          onClick={handleClick}
          size="small"
          sx={{
            bgcolor: ADMIN_PRIMARY.main,
            color: ADMIN_PRIMARY.contrastText,
            '&:hover': { bgcolor: ADMIN_PRIMARY.dark }
          }}
        >
          <Plus2Icon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  )
}
