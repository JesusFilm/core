import type { Journey, JourneyImage } from '../journeySchema'

export interface PhotoCandidate {
  description: string
  src: string
  width: number
  height: number
  blurhash: string
  downloadLocation: string
}

export interface ImageNeed {
  name: string
  search: string
  alt: string
  candidates: PhotoCandidate[]
}

export interface ImageDeps {
  searchPhotos: (
    query: string,
    orientation: 'portrait' | 'landscape'
  ) => Promise<PhotoCandidate[]>
  /** Returns the chosen candidate index per image name. */
  choosePhotos: (needs: ImageNeed[]) => Promise<Record<string, number>>
  triggerDownload: (downloadLocation: string) => Promise<void>
}

interface ImageSlot {
  name: string
  image: JourneyImage
  orientation: 'portrait' | 'landscape'
}

const CANDIDATES_PER_IMAGE = 5

/**
 * Fills src, width, height and blurhash on every image (ENG-3767 "Images").
 * The model writes only search and alt, so the photo fields are the server's
 * to add. Mutates `journey` in place.
 *
 * - An image that already carries a photo is kept, so resolving a journey
 *   twice does not search twice.
 * - An image is copied from the previous journey when the same name had the
 *   same search there. A changed search means a new photo.
 * - The rest are searched, and one model call chooses among the top results.
 *
 * Failures leave the image without a src rather than failing the run; the
 * returned warnings say which.
 */
export async function resolveImages(
  journey: Journey,
  previous: Journey | null,
  deps: ImageDeps
): Promise<string[]> {
  const previousImages = new Map(
    previous == null
      ? []
      : imageSlots(previous).map((slot) => [slot.name, slot.image])
  )

  const missing = imageSlots(journey).filter((slot) => {
    if (slot.image.src != null) return false
    const earlier = previousImages.get(slot.name)
    if (earlier?.src != null && earlier.search === slot.image.search) {
      Object.assign(slot.image, { ...earlier, alt: slot.image.alt })
      return false
    }
    return true
  })
  if (missing.length === 0) return []

  const warnings: string[] = []
  const needs: Array<ImageNeed & { slot: ImageSlot }> = []
  await Promise.all(
    missing.map(async (slot) => {
      try {
        const candidates = (
          await deps.searchPhotos(slot.image.search, slot.orientation)
        ).slice(0, CANDIDATES_PER_IMAGE)
        if (candidates.length === 0) {
          warnings.push(
            `image \`${slot.name}\`: no photos found for "${slot.image.search}".`
          )
          return
        }
        needs.push({
          slot,
          name: slot.name,
          search: slot.image.search,
          alt: slot.image.alt,
          candidates
        })
      } catch {
        warnings.push(`image \`${slot.name}\`: photo search failed.`)
      }
    })
  )
  if (needs.length === 0) return warnings

  let choices: Record<string, number> = {}
  try {
    choices = await deps.choosePhotos(
      needs.map(({ slot: _slot, ...need }) => need)
    )
  } catch {
    // Fall back to the top search result for every image.
  }

  await Promise.all(
    needs.map(async ({ slot, candidates }) => {
      const index = choices[slot.name]
      const chosen =
        index != null && candidates[index] != null
          ? candidates[index]
          : candidates[0]
      Object.assign(slot.image, {
        src: chosen.src,
        width: chosen.width,
        height: chosen.height,
        blurhash: chosen.blurhash
      })
      // Unsplash's terms require a download ping for every photo used.
      await deps.triggerDownload(chosen.downloadLocation).catch(() => {
        warnings.push(`image \`${slot.name}\`: download ping failed.`)
      })
    })
  )
  return warnings
}

function imageSlots(journey: Journey): ImageSlot[] {
  return journey.steps.flatMap((step) => {
    const slots: ImageSlot[] = []
    if (step.card.backgroundImage != null)
      slots.push({
        name: `${step.card.name}:cover`,
        image: step.card.backgroundImage,
        orientation: 'portrait'
      })
    step.card.content.forEach((item) => {
      if (item.type === 'image')
        slots.push({
          name: item.name,
          image: item.image,
          orientation: 'landscape'
        })
    })
    return slots
  })
}
