import Skeleton from '@mui/material/Skeleton'
import { ReactElement } from 'react'

import { useFlags } from '@core/shared/ui/FlagsProvider'

import { isJourneyCustomizable } from '../../../../libs/isJourneyCustomizable'
import { useJourney } from '../../../../libs/JourneyProvider'
import { CreateJourneyButton } from '../../CreateJourneyButton'
import { UseThisTemplateButton } from '../../UseThisTemplateButton'

interface TemplateActionButtonProps {
  variant?: 'menu-item' | 'button'
  signedIn?: boolean
  openTeamDialogOnSignIn?: boolean
  handleCloseMenu?: () => void
  refetchTemplateStats?: (templateIds: string[]) => Promise<void>
}

export function TemplateActionButton({
  variant = 'button',
  signedIn,
  openTeamDialogOnSignIn = false,
  handleCloseMenu,
  refetchTemplateStats
}: TemplateActionButtonProps): ReactElement {
  const { journey } = useJourney()
  const { customizableMedia } = useFlags()

  if (journey != null && isJourneyCustomizable(journey, customizableMedia)) {
    return <UseThisTemplateButton variant={variant} signedIn={signedIn} />
  }

  if (journey == null && variant === 'button') {
    return (
      <Skeleton
        sx={{ minWidth: 180, height: '38px', borderRadius: 3 }}
        data-testid="UseThisTemplateButtonSkeleton"
      />
    )
  }

  return (
    <CreateJourneyButton
      variant={variant}
      signedIn={signedIn}
      openTeamDialogOnSignIn={openTeamDialogOnSignIn}
      handleCloseMenu={handleCloseMenu}
      refetchTemplateStats={refetchTemplateStats}
    />
  )
}
