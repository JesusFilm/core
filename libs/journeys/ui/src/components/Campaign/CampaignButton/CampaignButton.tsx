import Box from '@mui/material/Box'
import MuiButton from '@mui/material/Button'
import type { CSSObject } from '@mui/material/styles'
import { MouseEvent, ReactElement } from 'react'

import {
  ButtonSize,
  ButtonVariant
} from '../../../../__generated__/globalTypes'
import { useCampaign } from '../CampaignProvider'
import { useCampaignSection } from '../CampaignSectionBand/CampaignSectionContext'
import { flexAlign } from '../libs/flexAlign'
import { contrastText } from '../libs/resolveBand'
import { hasText } from '../types'
import type { CampaignBlockOf } from '../types'

import { resolveCampaignAction } from './resolveCampaignAction'

interface CampaignButtonProps {
  block: CampaignBlockOf<'CampaignButtonBlock'>
}

function variantColors(
  variant: ButtonVariant,
  fill: string | undefined,
  label: string | undefined
): CSSObject {
  if (variant === ButtonVariant.contained)
    return {
      backgroundColor: fill,
      color: label,
      '&:hover': { backgroundColor: fill, filter: 'brightness(0.92)' }
    }
  if (variant === ButtonVariant.outlined)
    return { borderColor: fill, color: fill, '&:hover': { borderColor: fill } }
  return { color: fill }
}

/**
 * The campaign call-to-action. `variant` null ⇒ contained, `size` null ⇒
 * medium, `align` null follows the section, `color` null ⇒ the section's
 * button colour then the theme primary, `labelColor` null ⇒ the contrast
 * text of the block's own `color` when it has one, else the section's button
 * text colour then on-primary. A missing action target renders the
 * button static: same look, no href, aria-disabled, no pointer effect.
 */
export function CampaignButton({
  block
}: CampaignButtonProps): ReactElement | null {
  const campaign = useCampaign()
  const section = useCampaignSection()
  if (!hasText(block.label)) return null

  const variant = block.buttonVariant ?? ButtonVariant.contained
  const size = block.size ?? ButtonSize.medium
  const align = block.align ?? section?.align ?? null
  const fill = block.color ?? section?.band.button
  const label =
    block.labelColor ??
    (block.color != null
      ? contrastText(block.color)
      : section?.band.buttonLabel)
  const resolved = resolveCampaignAction(block.action, campaign)

  const colorSx = variantColors(variant, fill, label)

  function handleClick(event: MouseEvent<HTMLAnchorElement>): void {
    if (resolved?.scrollToBlockId == null) return
    const target = document.getElementById(resolved.scrollToBlockId)
    if (target == null) return
    event.preventDefault()
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', resolved.href)
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: flexAlign(align) }}>
      {resolved == null ? (
        <MuiButton
          component="span"
          variant={variant}
          size={size}
          aria-disabled="true"
          tabIndex={-1}
          disableRipple
          data-testid="CampaignButton"
          sx={{
            ...colorSx,
            whiteSpace: 'pre-line',
            pointerEvents: 'none',
            cursor: 'default'
          }}
        >
          {block.label}
        </MuiButton>
      ) : (
        <MuiButton
          href={resolved.href}
          target={resolved.target}
          rel={resolved.target != null ? 'noopener noreferrer' : undefined}
          onClick={handleClick}
          variant={variant}
          size={size}
          data-testid="CampaignButton"
          sx={{ ...colorSx, whiteSpace: 'pre-line' }}
        >
          {block.label}
        </MuiButton>
      )}
    </Box>
  )
}
