import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import X2 from '@core/shared/ui/icons/X2'

import { JourneyMenuButtonIcon } from '../../../../__generated__/globalTypes'
import { useEditor } from '../../../libs/EditorProvider'
import { useJourney } from '../../../libs/JourneyProvider'
import { getMenuIcon } from '../utils/getMenuIcon'

export function StepHeaderMenu(): ReactElement {
  const { journey, variant } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()
  const { menuStepBlock, menuButtonIcon } = journey ?? {}

  const router = useRouter()

  const stepSlug = router.query.stepSlug as string

  const isMenu =
    menuStepBlock != null &&
    (selectedStep?.id === menuStepBlock.id ||
      menuStepBlock.slug === stepSlug ||
      menuStepBlock.id === stepSlug)

  let Icon: typeof SvgIcon | null =
    variant === 'admin' ? getMenuIcon(JourneyMenuButtonIcon.menu1) : null

  if (menuButtonIcon != null) {
    if (isMenu) {
      Icon = X2
    } else {
      Icon = getMenuIcon(menuButtonIcon)
    }
  }

  const handleClick = (): void => {
    if (journey == null || menuStepBlock == null) return

    if (isMenu) {
      void router.back()
    } else {
      const { slug, id } = menuStepBlock

      void router.push(`/${journey?.slug}/${slug ?? id}`)
    }
  }
  const isEmpty = menuButtonIcon === null && variant === 'admin'

  return (
    <Box
      sx={{
        borderRadius: 100,
        border: isEmpty ? 'dashed' : null,
        borderWidth: 3,
        borderColor: ({ palette }) => palette.grey[700],
        minHeight: 44,
        minWidth: 44,
        display: 'grid',
        placeItems: 'center',
        maxWidth: 'min-content',
        opacity: menuButtonIcon == null ? 0.5 : 1
      }}
      data-testid="StepHeaderMenu"
    >
      {Icon != null && (
        <>
          {variant === 'default' && menuStepBlock != null ? (
            <IconButton onClick={handleClick}>
              <Icon />
            </IconButton>
          ) : (
            <Icon
              sx={{
                color: ({ palette }) =>
                  isEmpty ? palette.grey[700] : undefined
              }}
            />
          )}
        </>
      )}
    </Box>
  )
}
