export interface MediaComponent {
  mediaComponentId: string
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
    if (key === 'imageUrls') return
    if (key === 'isDownloadable' && !obj1[key] && !obj2[key]) return
    if (
      key === 'downloadSizes' &&
      (!obj1[key] || Object.keys(obj1[key]).length === 0) &&
      (!obj2[key] || Object.keys(obj2[key]).length === 0)
    )
      return

    const val1 = obj1[key] === '' ? null : obj1[key]
    const val2 = obj2[key] === '' ? null : obj2[key]

    if (val1 === undefined && val2 === undefined) return
    if (val1 === null && val2 === null) return
    if (
      typeof val1 === 'object' &&
      typeof val2 === 'object' &&
      val1 !== null &&
      val2 !== null &&
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
