import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import X2 from '@core/shared/ui/icons/X2'

import { JourneyMenuButtonIcon } from '../../../../__generated__/globalTypes'
import { useJourney } from '../../../libs/JourneyProvider'
import { transformer } from '../../../libs/transformer'
import { getMenuIcon } from '../utils/getMenuIcon'

export function StepHeaderMenu(): ReactElement {
  const { journey, variant } = useJourney()

  const router = useRouter()

  const blocks = transformer(journey?.blocks ?? [])
  const stepSlug = router.query.stepSlug as string

  const stepBlock = blocks.find(
    (block) =>
      block.__typename === 'StepBlock' &&
      (block.slug === stepSlug || block.id === stepSlug)
  )

  const isMenu =
    journey?.menuStepBlock != null &&
    stepBlock?.id === journey?.menuStepBlock.id

  let Icon: typeof SvgIcon | null =
    variant === 'admin' ? getMenuIcon(JourneyMenuButtonIcon.menu1) : null

  if (journey != null && journey.menuButtonIcon != null) {
    if (isMenu) {
      Icon = X2
    } else {
      Icon = getMenuIcon(journey.menuButtonIcon)
    }
  }

  const handleClick = (): void => {
    if (journey == null || journey.menuStepBlock == null) return

    if (isMenu) {
      void router.back()
    } else {
      const { slug, id } = journey.menuStepBlock

      void router.push(`/${journey?.slug}/${slug ?? id}`)
    }
  }

  return (
    <Box
      sx={{
        borderRadius: 100,
        border:
          journey?.menuButtonIcon == null && variant === 'admin'
            ? 'dashed'
            : null,
        minHeight: 48,
        minWidth: 48,
        display: 'grid',
        placeItems: 'center',
        maxWidth: 'min-content',
        opacity: journey?.menuButtonIcon == null ? 0.6 : 1
      }}
      data-testid="StepHeaderMenu"
    >
      {Icon != null && (
        <>
          {variant === 'default' && journey?.menuStepBlock != null ? (
            <IconButton onClick={handleClick}>
              <Icon />
            </IconButton>
          ) : (
            <Icon />
          )}
        </>
      )}
    </Box>
  )
}
