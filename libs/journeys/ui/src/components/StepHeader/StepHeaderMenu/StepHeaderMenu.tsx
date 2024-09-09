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
    journey?.menuStepBlockId != null &&
    stepBlock?.id === journey?.menuStepBlockId

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
    if (journey == null) return

    if (isMenu) {
      void router.back()
    } else {
      const route = `/${journey?.slug ?? journey.id}/${
        journey?.menuStepBlock?.slug ?? journey.menuStepBlockId
      }`
      void router.push(route)
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
        maxWidth: 'min-content'
      }}
      data-testid="Menu"
    >
      {Icon != null && (
        <>
          {variant === 'default' && journey?.menuStepBlockId != null ? (
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
