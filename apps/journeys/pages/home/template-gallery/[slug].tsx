import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import {
  isEmbedUrlAllowed,
  resolveEmbedHosts
} from '@core/journeys/ui/TemplateGalleryMedia'

import {
  GetTemplateGalleryPage,
  GetTemplateGalleryPageVariables,
  GetTemplateGalleryPage_templateGalleryPageBySlug as TemplateGalleryPage
} from '../../../__generated__/GetTemplateGalleryPage'
import { TemplateGalleryPageMediaType } from '../../../__generated__/globalTypes'
import i18nConfig from '../../../next-i18next.config'
import { TemplateGalleryView } from '../../../src/components/TemplateGalleryView'
import { createApolloClient } from '../../../src/libs/apolloClient'
import { getFlags } from '../../../src/libs/getFlags'
import { GET_TEMPLATE_GALLERY_PAGE } from '../../../src/libs/getTemplateGalleryPage'
import { isValidGallerySlug } from '../../../src/libs/isValidGallerySlug'

/**
 * Defense-in-depth at the read boundary: strip a `link` media whose
 * server-normalized `embedUrl` is not a https URL on the embed-host allowlist,
 * so an off-allowlist or non-https URL never reaches the client iframe even if
 * the API's save-time normalizer regresses. The allowlist is the same
 * `TEMPLATE_LIBRARY_EMBED_HOSTS` Doppler secret the API uses, read here
 * server-side (no `NEXT_PUBLIC_`) so a Doppler change applies at runtime.
 * `mux` media carries no URL and passes through (its playbackId is shape-
 * guarded where it is interpolated into the Mux URLs).
 */
function withGatedMedia(gallery: TemplateGalleryPage): TemplateGalleryPage {
  const { media } = gallery
  if (media == null || media.type !== TemplateGalleryPageMediaType.link) {
    return gallery
  }
  const allowedHosts = resolveEmbedHosts(
    process.env.TEMPLATE_LIBRARY_EMBED_HOSTS
  )
  if (media.embedUrl != null && isEmbedUrlAllowed(media.embedUrl, allowedHosts)) {
    return gallery
  }
  return { ...gallery, media: null }
}

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'your.nextstep.is'

interface TemplateGalleryPageRouteProps {
  gallery: TemplateGalleryPage
}

function ogImageFor(
  gallery: TemplateGalleryPage
): { url: string; width?: number; height?: number; alt: string }[] {
  if (gallery.creatorImageSrc != null && gallery.creatorImageSrc !== '') {
    const alt =
      gallery.creatorImageAlt != null && gallery.creatorImageAlt !== ''
        ? gallery.creatorImageAlt
        : gallery.creatorName
    return [{ url: gallery.creatorImageSrc, alt }]
  }

  const firstWithImage = gallery.templates.find(
    (template) =>
      template.primaryImageBlock?.src != null &&
      template.primaryImageBlock.src !== ''
  )
  const image = firstWithImage?.primaryImageBlock
  if (image?.src != null && image.src !== '') {
    return [
      {
        url: image.src,
        width: image.width,
        height: image.height,
        alt: image.alt
      }
    ]
  }

  return []
}

function TemplateGalleryPageRoute({
  gallery
}: TemplateGalleryPageRouteProps): ReactElement {
  const canonicalUrl = `https://${ROOT_DOMAIN}/template-gallery/${gallery.slug}`

  return (
    <>
      <NextSeo
        title={gallery.title}
        description={gallery.description}
        canonical={canonicalUrl}
        openGraph={{
          type: 'website',
          title: gallery.title,
          description: gallery.description,
          url: canonicalUrl,
          images: ogImageFor(gallery)
        }}
        twitter={{
          site: '@YourNextStepIs',
          cardType: 'summary_large_image'
        }}
      />
      <TemplateGalleryView gallery={gallery} />
    </>
  )
}

// SSR rather than ISR. The page is admin-managed and supports
// unpublish→republish cycles; `notFound` stickiness in ISR previously
// trapped the page in a 404 state across a republish, so we render
// every request fresh. `Query.templateGalleryPageBySlug` is uncached in
// Yoga (TTL 0) — one indexed slug lookup per request is trivial and
// makes mutation visibility immediate (NES-1644).
export const getServerSideProps: GetServerSideProps<
  TemplateGalleryPageRouteProps
> = async (context) => {
  // Prevent the browser (and any intermediate CDN) from caching the
  // page response — an unpublished→republished slug must never be
  // served from a stale browser cache.
  context.res.setHeader('Cache-Control', 'no-store, max-age=0')

  const slug = context.params?.slug?.toString() ?? ''
  const translations = await serverSideTranslations(
    context.locale ?? 'en',
    ['apps-journeys', 'libs-journeys-ui'],
    i18nConfig
  )

  if (!isValidGallerySlug(slug)) {
    return { props: { ...translations }, notFound: true }
  }

  const apolloClient = createApolloClient()
  const { data, errors } = await apolloClient.query<
    GetTemplateGalleryPage,
    GetTemplateGalleryPageVariables
  >({
    query: GET_TEMPLATE_GALLERY_PAGE,
    variables: { slug },
    errorPolicy: 'all'
  })

  const gallery = data?.templateGalleryPageBySlug
  if (gallery == null) {
    // Only log when there are actual errors. A legitimate not-found
    // (draft / unknown slug) is a noisy public path — every probe
    // would otherwise add a log line. The signal we care about is the
    // error-but-null shape that hid the NES-1644 cache bug.
    if (errors != null && errors.length > 0) {
      const MAX_LOGGED_ERRORS = 5
      const safeErrors = errors.slice(0, MAX_LOGGED_ERRORS).map((e) => ({
        message: e.message,
        path: e.path,
        code: typeof e.extensions?.code === 'string' ? e.extensions.code : null
      }))
      console.warn('[template-gallery getServerSideProps] null branch', {
        slug,
        errorCount: errors.length,
        errors: safeErrors,
        truncated: errors.length > MAX_LOGGED_ERRORS
      })
    }
    return { props: { ...translations }, notFound: true }
  }

  return {
    props: {
      flags: await getFlags(),
      ...translations,
      gallery: withGatedMedia(gallery)
    }
  }
}

export default TemplateGalleryPageRoute
