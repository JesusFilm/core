interface ImageUrls {
  thumbnail?: string
  videoStill?: string
  mobileCinematicHigh?: string
  mobileCinematicLow?: string
  mobileCinematicVeryLow?: string
}

interface MediaComponent {
  mediaComponentId: string
  componentType: string
  subType: string
  contentType: string
  imageUrls: ImageUrls
  [key: string]: any
}

export interface ApiResponse {
  _embedded: {
    mediaComponents: MediaComponent[]
  }
}

export function convertArrayToObject(
  array: MediaComponent[],
  key: keyof MediaComponent
): Record<string, MediaComponent> {
  return array.reduce(
    (obj, item) => {
      obj[item[key] as string] = item
      return obj
    },
    {} as Record<string, MediaComponent>
  )
}

export function getObjectDiff(
  obj1: Record<string, any>,
  obj2: Record<string, any>
): string[] {
  const diff: string[] = []
  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])

  keys.forEach((key) => {
    // imageUrls are tested in a different test because they are not always present in base arclight and all urls are different
    if (key === 'imageUrls') return

    const val1 = obj1[key] === '' ? null : obj1[key]
    const val2 = obj2[key] === '' ? null : obj2[key]

    if (val1 === undefined && val2 === undefined) return
    if (val1 === null && val2 === null) return
    if (
      typeof val1 === 'object' &&
      typeof val2 === 'object' &&
      Object.keys(val1).length === 0 &&
      Object.keys(val2).length === 0
    )
      return

    if (val1 !== val2 && JSON.stringify(val1) !== JSON.stringify(val2)) {
      diff.push(key)
    }
  })

  return diff
}

export function getTaxonomyDiff(
  taxonomy1: Record<string, any>,
  taxonomy2: Record<string, any>
): string[] {
  const diff: string[] = []
  const keys = new Set([...Object.keys(taxonomy1), ...Object.keys(taxonomy2)])

  keys.forEach((key) => {
    const val1 = taxonomy1[key]
    const val2 = taxonomy2[key]

    if (val1 === undefined && val2 === undefined) return
    if (val1 === null && val2 === null) return

    // For objects with terms, sort the keys before comparison
    if (
      key === 'terms' &&
      typeof val1 === 'object' &&
      typeof val2 === 'object'
    ) {
      const sortedVal1 = Object.fromEntries(
        Object.entries(val1).sort(([a], [b]) => a.localeCompare(b))
      )
      const sortedVal2 = Object.fromEntries(
        Object.entries(val2).sort(([a], [b]) => a.localeCompare(b))
      )
      if (JSON.stringify(sortedVal1) !== JSON.stringify(sortedVal2)) {
        diff.push(key)
      }
      return
    }

    if (val1 !== val2 && JSON.stringify(val1) !== JSON.stringify(val2)) {
      diff.push(key)
    }
  })

  return diff
}
