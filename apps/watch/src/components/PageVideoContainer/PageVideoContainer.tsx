import last from 'lodash/last'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'

import { ThemeMode } from '@core/shared/ui/themes'

import { useVideoChildren } from '../../libs/useVideoChildren'
import { getLabelDetails } from '../../libs/utils/getLabelDetails/getLabelDetails'
import { useVideo } from '../../libs/videoContext'
import { ContentPageBlurFilter } from '../ContentPageBlurFilter'
import { DialogShare } from '../DialogShare'
import { PageWrapper } from '../PageWrapper'
import { VideoGrid } from '../VideoGrid/VideoGrid'

import { CollectionContentHeader } from './CollectionContentHeader'
import { CollectionHero } from './CollectionHero'
import { ContainerDescription } from './ContainerDescription'

// Usually Series or Collection Videos
export function PageVideoContainer(): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-watch')
  const { snippet, slug, variant, label, childrenCount } = useVideo()
  const { loading, children } = useVideoChildren(variant?.slug, router.locale)
  const [shareDialog, setShareDialog] = useState<boolean>(false)
  const { label: labelText, childCountLabel } = getLabelDetails(
    t,
    label,
    childrenCount
  )
  const snippetText = last(snippet)?.value ?? ''
  function handleOpenDialog(): void {
    setShareDialog(true)
  }

  function handleCloseDialog(): void {
    setShareDialog(false)
  }

  return (
    <PageWrapper
      hero={<CollectionHero />}
      headerThemeMode={ThemeMode.dark}
      hideHeader
      hideFooter
    >
      <ContentPageBlurFilter>
        <CollectionContentHeader
          label={labelText}
          childCountLabel={childCountLabel}
          onShare={handleOpenDialog}
        />
        <div
          className="responsive-container flex flex-col gap-10 py-10"
          data-testid="PageVideoContainer"
        >
          {snippetText !== '' && (
            <ContainerDescription value={snippetText} />
          )}
          <DialogShare open={shareDialog} onClose={handleCloseDialog} />
          <VideoGrid
            containerSlug={slug}
            videos={children}
            loading={loading}
            orientation="vertical"
          />
        </div>
      </ContentPageBlurFilter>
    </PageWrapper>
  )
}
