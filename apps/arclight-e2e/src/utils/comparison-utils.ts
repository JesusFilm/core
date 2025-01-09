/**
 * Converts an array of objects to a record using a specified key
 */
export function convertArrayToObject<T extends Record<string, any>>(
  array: T[],
  key: keyof T
): Record<string, T> {
  return array.reduce(
    (obj, item) => {
      obj[item[key] as string] = item
      return obj
    },
    {} as Record<string, T>
  )
}

/**
 * Compares two objects and returns an array of differing keys
 * Ignores imageUrls and empty objects/arrays
 */
export function getObjectDiff(
  obj1: Record<string, any>,
  obj2: Record<string, any>,
  ignoredKeys: string[] = ['imageUrls'],
  customComparisons: Record<string, (val1: any, val2: any) => boolean> = {}
): string[] {
  const diff: string[] = []
  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])

  keys.forEach((key) => {
    if (ignoredKeys.includes(key)) return

    const val1 = normalizeValue(obj1[key])
    const val2 = normalizeValue(obj2[key])

    if (shouldSkipComparison(val1, val2)) return

    if (customComparisons[key]) {
      if (!customComparisons[key](val1, val2)) {
        diff.push(key)
      }
      return
    }

    if (!isEqual(val1, val2)) {
      diff.push(key)
    }
  })

  return diff
}

/**
 * Specialized version of getObjectDiff for taxonomy comparison
 * Handles term sorting and specific taxonomy comparison logic
 */
export function getTaxonomyDiff(
  taxonomy1: Record<string, any>,
  taxonomy2: Record<string, any>
): string[] {
  return getObjectDiff(taxonomy1, taxonomy2, [], {
    terms: (val1: any, val2: any) => {
      if (typeof val1 !== 'object' || typeof val2 !== 'object') return false

      const sortedVal1 = sortObjectKeys(val1)
      const sortedVal2 = sortObjectKeys(val2)

      return JSON.stringify(sortedVal1) === JSON.stringify(sortedVal2)
    }
  })
}

// Helper Functions

function normalizeValue(value: any): any {
  if (value === '') return null
  return value
}

function shouldSkipComparison(val1: any, val2: any): boolean {
  if (val1 === undefined && val2 === undefined) return true
  if (val1 === null && val2 === null) return true
  if (
    typeof val1 === 'object' &&
    typeof val2 === 'object' &&
    Object.keys(val1).length === 0 &&
    Object.keys(val2).length === 0
  )
    return true
  return false
}

function isEqual(val1: any, val2: any): boolean {
  if (val1 === val2) return true
  return JSON.stringify(val1) === JSON.stringify(val2)
}

function sortObjectKeys<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b))
  ) as T
}
