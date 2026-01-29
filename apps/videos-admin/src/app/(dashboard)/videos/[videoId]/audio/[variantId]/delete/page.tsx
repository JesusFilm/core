import { DeleteAudioClient } from './DeleteAudioClient'

type PageProps = {
  // In Next.js, `params` can be async. Typing as a Promise keeps this page compatible with
  // Next's `PageProps` constraint across versions/configs.
  params: Promise<{
    videoId: string
    variantId: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { videoId, variantId } = await params

  return <DeleteAudioClient videoId={videoId} variantId={variantId} />
}
