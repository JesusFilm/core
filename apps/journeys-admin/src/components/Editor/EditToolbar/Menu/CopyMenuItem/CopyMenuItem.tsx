import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Divider from '@mui/material/Divider'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { JourneyFields as Journey } from '../../../../../../__generated__/JourneyFields'
import { MenuItem } from '../../../../MenuItem'

interface Props {
  journey: Journey
  isVisible?: boolean
  onClick?: () => void
}

export function CopyMenuItem({
  isVisible,
  journey,
  onClick
}: Props): ReactElement {
  const { enqueueSnackbar } = useSnackbar()

  const handleCopyLink = async (): Promise<void> => {
    if (journey == null) return

    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'}/${
        journey.slug
      }`
    )
    onClick?.()
    enqueueSnackbar('Link Copied', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <>
      {isVisible === true && (
        <>
          <Divider />
          <MenuItem
            label="Copy Link"
            icon={<ContentCopyIcon />}
            onClick={handleCopyLink}
          />
        </>
      )}
    </>
  )
}
