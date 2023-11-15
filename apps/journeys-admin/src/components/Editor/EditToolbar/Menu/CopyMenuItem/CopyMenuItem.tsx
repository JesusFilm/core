import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import LingAngledIcon from '@core/shared/ui/icons/LinkAngled'

import { JourneyFields as Journey } from '../../../../../../__generated__/JourneyFields'
import { MenuItem } from '../../../../MenuItem'

interface CopyMenuItemProps {
  journey: Journey
  onClose?: () => void
}

export function CopyMenuItem({
  journey,
  onClose
}: CopyMenuItemProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()

  const handleCopyLink = async (): Promise<void> => {
    if (journey == null) return

    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'}/${
        journey.slug
      }`
    )
    onClose?.()
    enqueueSnackbar('Link Copied', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <MenuItem
      label="Copy Link"
      icon={<LingAngledIcon />}
      onClick={handleCopyLink}
      testId="Copy"
    />
  )
}
