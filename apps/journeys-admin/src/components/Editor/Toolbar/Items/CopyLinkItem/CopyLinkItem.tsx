import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ComponentProps, ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import LinkAngledIcon from '@core/shared/ui/icons/LinkAngled'

import { useCustomDomainsQuery } from '../../../../../libs/useCustomDomainsQuery'
import { Item } from '../Item/Item'

interface CopyLinkItemProps {
  variant: ComponentProps<typeof Item>['variant']
  onClose?: () => void
}

export function CopyLinkItem({
  variant,
  onClose
}: CopyLinkItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { journey } = useJourney()
  const { hostname } = useCustomDomainsQuery({
  const { t } = useTranslation('apps-journeys-admin')
    variables: { teamId: journey?.team?.id ?? '' },
    skip: journey?.team?.id == null
  })

  const handleCopyLink = async (): Promise<void> => {
    if (journey == null) return

    await navigator.clipboard.writeText(
      `${
        hostname != null
          ? `https://${hostname}`
          : (process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is')
      }/${journey.slug}`
    )
    onClose?.()
    enqueueSnackbar(t('Link Copied'), {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <Item
      variant={variant}
      label={t('Copy Link')}
      icon={<LinkAngledIcon />}
      onClick={handleCopyLink}
    />
  )
}
