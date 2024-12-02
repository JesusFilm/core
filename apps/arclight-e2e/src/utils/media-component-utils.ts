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
    if (
      !obj1[key] ||
      !obj2[key] ||
      JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])
    ) {
      diff.push(key)
    }
  })

  return diff
}
