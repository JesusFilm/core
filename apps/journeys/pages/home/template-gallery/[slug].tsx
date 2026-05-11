import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement, useEffect, useState } from 'react'

import {
  GetTemplateGalleryPage_templateGalleryPageBySlug_templates as GalleryTemplate,
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

// Derive the admin URL that matches the current deployment context. The env
// var is the source of truth when set; otherwise infer from the current
// browser location so links don't silently leak across environments
// (e.g. local dev pointing at production admin).
function deriveAdminUrlFromLocation(): string | null {
  if (typeof window === 'undefined') return null
  const { protocol, hostname, port } = window.location
  // Local dev: journeys is on :4100, admin is on :4200.
  if (port === '4100') return `${protocol}//${hostname}:4200`
  // Stage / prod: subdomain pattern your.* → admin.* (e.g. your.nextstep.is →
  // admin.nextstep.is, your.nextstep.stage → admin.nextstep.stage).
  if (hostname.startsWith('your.')) {
    return `${protocol}//${hostname.replace('your.', 'admin.')}`
  }
  return null
}

function useAdminUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL
  const [adminUrl, setAdminUrl] = useState<string>(envUrl ?? '')
  useEffect(() => {
    if (envUrl != null && envUrl !== '') return
    const derived = deriveAdminUrlFromLocation()
    if (derived != null) setAdminUrl(derived)
  }, [envUrl])
  return adminUrl
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
  const adminUrl = useAdminUrl()

  // NES-1608 deep link target. The admin app may not yet handle this query
  // param; that is intentional — wiring the URL here unblocks public sharing
  // ahead of the admin-side modal landing.
  const buildTemplateHref = (template: GalleryTemplate): string =>
    `${adminUrl}/?useTemplate=${encodeURIComponent(template.id)}`

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
      <TemplateGalleryView
        gallery={gallery}
        buildTemplateHref={buildTemplateHref}
      />
    </>
  )
}

export const getStaticProps: GetStaticProps<
  TemplateGalleryPageRouteProps
> = async (context) => {
  const slug = context.params?.slug?.toString() ?? ''
  const translations = await serverSideTranslations(
    context.locale ?? 'en',
    ['apps-journeys', 'libs-journeys-ui'],
    i18nConfig
  )

  if (!isValidGallerySlug(slug)) {
    return {
      props: { ...translations },
      notFound: true,
      revalidate: 60
    }
  }

  const apolloClient = createApolloClient()
  const { data } = await apolloClient.query<
    GetTemplateGalleryPage,
    GetTemplateGalleryPageVariables
  >({
    query: GET_TEMPLATE_GALLERY_PAGE,
    variables: { slug },
    errorPolicy: 'all'
  })

  const gallery = data?.templateGalleryPageBySlug
  if (gallery == null) {
    return {
      props: { ...translations },
      notFound: true,
      revalidate: 60
    }
  }

  return {
    props: {
      flags: await getFlags(),
      ...translations,
      gallery
    },
    revalidate: 60
  }
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking'
})

export default TemplateGalleryPageRoute
