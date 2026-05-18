import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import {
  GetTemplateGalleryPage,
  GetTemplateGalleryPageVariables,
  GetTemplateGalleryPage_templateGalleryPageBySlug as TemplateGalleryPage
} from '../../../__generated__/GetTemplateGalleryPage'
import i18nConfig from '../../../next-i18next.config'
import { TemplateGalleryView } from '../../../src/components/TemplateGalleryView'
import { createApolloClient } from '../../../src/libs/apolloClient'
import { getFlags } from '../../../src/libs/getFlags'
import { GET_TEMPLATE_GALLERY_PAGE } from '../../../src/libs/getTemplateGalleryPage'
import { isValidGallerySlug } from '../../../src/libs/isValidGallerySlug'

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

// SSR (not ISR) by design. Template-gallery pages are admin-managed and
// support unpublish→republish cycles; ISR's cached `notFound` state was
// observed to stick across mutation-driven revalidates on Next 16 Pages
// Router, leaving "View the page" 404-ing for ~60s after a republish.
// SSR sidesteps that entirely — every request hits the API, which already
// runs at TTL 0 for `templateGalleryPageBySlug`. Load is one indexed slug
// lookup per request; trivial.
export const getServerSideProps: GetServerSideProps<
  TemplateGalleryPageRouteProps
> = async (context) => {
  // Prevent any browser/intermediate cache from holding a 404 across the
  // unpublish→republish cycle. Without this, a browser that hit the page
  // while it was draft (404) would re-serve that cached 404 from its own
  // HTTP cache, even after the page is republished and SSR would return
  // the row fresh. `no-store` is the strongest directive — never cache,
  // never reuse. Trivial perf cost: each request rerenders, which is
  // already what SSR does anyway.
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
      gallery
    }
  }
}

export default TemplateGalleryPageRoute
