import { GetStaticPaths, GetStaticProps } from 'next'
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
    // Surface BOTH the GraphQL errors AND the null-branch entry so we
    // can distinguish "legitimate not-found / draft" from "Apollo error
    // returned null silently". Without this, the silent notFound that
    // ISR caches looks identical to a real not-found and the cause
    // hides behind the 60s revalidate window.
    console.warn('[template-gallery getStaticProps] null branch', {
      slug,
      hasErrors: errors != null && errors.length > 0,
      errorCount: errors?.length ?? 0,
      errors:
        errors?.map((e) => ({
          message: e.message,
          path: e.path,
          extensions: e.extensions
        })) ?? null
    })
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
