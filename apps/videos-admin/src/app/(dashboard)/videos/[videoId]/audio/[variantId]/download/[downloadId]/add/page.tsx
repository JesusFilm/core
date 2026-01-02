import { AddVideoVariantDownloadDialogClient } from './AddVideoVariantDownloadDialogClient'

type PageProps = {
  params: Promise<{
    videoId: string
    variantId: string
    downloadId: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { videoId, variantId, downloadId } = await params

  return (
    <AddVideoVariantDownloadDialogClient
      videoId={videoId}
      variantId={variantId}
      languageId={downloadId}
    />
  )
}
