import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import Menu1 from '@core/shared/ui/icons/Menu1'
import X2 from '@core/shared/ui/icons/X2'

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

  const handleClick = (): void => {
    if (journey == null || menuStepBlock == null) return

    if (isMenu) {
      void router.back()
    } else {
      const { slug, id } = menuStepBlock

      void router.push(`/${journey?.slug}/${slug ?? id}`)
    }
  }

  const isEmpty = journey?.showMenu !== true || menuButtonIcon == null
  const showFallback = variant === 'admin' && isEmpty

  return (
    <Box
      sx={{
        borderRadius: 100,
        border: showFallback ? 'dashed' : null,
        borderWidth: 3,
        borderColor: ({ palette }) => palette.grey[700],
        minHeight: 44,
        minWidth: 44,
        display: 'grid',
        placeItems: 'center',
        maxWidth: 'min-content',
        opacity: showFallback ? 0.5 : 1
      }}
      data-testid="StepHeaderMenu"
    >
      {(() => {
        if (isEmpty)
          return variant === 'admin' ? (
            <Menu1 sx={{ color: ({ palette }) => palette.grey[700] }} />
          ) : null

        const Icon = isMenu ? X2 : getMenuIcon(menuButtonIcon)

        return (
          <IconButton disabled={variant === 'admin'} onClick={handleClick}>
            <Icon sx={{ color: 'white' }} />
          </IconButton>
        )
      })()}
    </Box>
  )
}
