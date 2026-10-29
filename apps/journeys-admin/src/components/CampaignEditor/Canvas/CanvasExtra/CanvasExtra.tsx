import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { TypographyVariant } from '../../../../../__generated__/globalTypes'
import { CampaignTextField } from '../../../../libs/useCampaignBlockTextMutation'
import { blockLabel } from '../../utils/blockLabel'
import type { CanvasBlock } from '../canvasBlock'
import { HOVER_OUTLINE_SX, SELECTED_OUTLINE } from '../hoverOutline'
import { InlineText } from '../InlineText'
import { selectableProps } from '../selectable'
import { SelectionBadge } from '../SelectionBadge'

interface CanvasExtraProps {
  block: CanvasBlock
  selected: boolean
  onSelect: () => void
  focusField?: CampaignTextField
}

/** A text or button Extra: click (or Enter) to select, edit its one text field in place. */
export function CanvasExtra({
  block,
  selected,
  onSelect,
  focusField
}: CanvasExtraProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const selectable = selectableProps(onSelect, blockLabel(t, block.__typename))

  switch (block.__typename) {
    case 'CampaignTypographyBlock':
      return (
        <Box
          id={block.id}
          data-testid={`CanvasExtra-${block.id}`}
          data-selected={selected}
          data-hoverable
          role="button"
          {...selectable}
          sx={{
            position: 'relative',
            width: '100%',
            cursor: 'pointer',
            ...HOVER_OUTLINE_SX,
            ...(selected ? SELECTED_OUTLINE : {})
          }}
        >
          <SelectionBadge
            id={block.id}
            label={blockLabel(t, block.__typename)}
            selected={selected}
          />
          <InlineText
            target={{ block, field: 'content' }}
            placeholder={t('Your text')}
            editing={selected}
            autoFocus={selected && focusField === 'content'}
            onSelect={onSelect}
            variant={block.typographyVariant ?? TypographyVariant.body1}
            variantMapping={{ overline: 'p', caption: 'p' }}
            align={block.align ?? undefined}
            sx={{ color: block.color ?? 'var(--campaign-band-text)' }}
          />
        </Box>
      )
    case 'CampaignButtonBlock': {
      const buttonVariant = block.buttonVariant ?? 'contained'
      return (
        <Box
          id={block.id}
          data-testid={`CanvasExtra-${block.id}`}
          data-selected={selected}
          data-hoverable
          role="button"
          {...selectable}
          sx={{
            position: 'relative',
            display: 'flex',
            cursor: 'pointer',
            ...HOVER_OUTLINE_SX,
            ...(selected ? SELECTED_OUTLINE : {}),
            justifyContent:
              block.align === 'center'
                ? 'center'
                : block.align === 'right'
                  ? 'flex-end'
                  : block.align === 'left'
                    ? 'flex-start'
                    : 'inherit'
          }}
        >
          <SelectionBadge
            id={block.id}
            label={blockLabel(t, block.__typename)}
            selected={selected}
          />
          <Button
            component="div"
            variant={buttonVariant}
            size={block.size ?? 'medium'}
            data-testid="CanvasButton"
            tabIndex={-1}
            // Selecting is not a press: no ripple, and the hover only dims
            // the campaign colour as the public CampaignButton does.
            disableRipple
            sx={{
              bgcolor:
                buttonVariant === 'contained'
                  ? (block.color ?? 'var(--campaign-band-button)')
                  : undefined,
              color:
                buttonVariant === 'contained'
                  ? (block.labelColor ?? 'var(--campaign-band-button-label)')
                  : (block.color ?? 'var(--campaign-band-button)'),
              borderColor: block.color ?? 'var(--campaign-band-button)',
              '&:hover': {
                bgcolor:
                  buttonVariant === 'contained'
                    ? (block.color ?? 'var(--campaign-band-button)')
                    : undefined,
                borderColor: block.color ?? 'var(--campaign-band-button)',
                filter:
                  buttonVariant === 'contained' ? 'brightness(0.92)' : undefined
              }
            }}
          >
            <InlineText
              target={{ block, field: 'label' }}
              placeholder={t('Button')}
              editing={selected}
              autoFocus={selected && focusField === 'label'}
              onSelect={onSelect}
              variant="inherit"
              component="span"
              autoWidth
            />
          </Button>
        </Box>
      )
    }
    default:
      return null
  }
}
