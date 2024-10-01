export interface MediaComponent {
  mediaComponentId: string
  [key: string]: unknown
}

export function compareMediaComponents(
  baseComponents: MediaComponent[],
  compareComponents: MediaComponent[]
): string[] {
  const differences: string[] = []

  const baseMap = new Map(
    baseComponents.map((comp) => [comp.mediaComponentId, comp])
  )
  const compareMap = new Map(
    compareComponents.map((comp) => [comp.mediaComponentId, comp])
  )

  // Check for components only in base
  baseMap.forEach((comp, id) => {
    if (!compareMap.has(id)) {
      differences.push(`Media Component ${id} only in base URL`)
    }
  })

  // Check for components only in compare
  compareMap.forEach((comp, id) => {
    if (!baseMap.has(id)) {
      differences.push(`Media Component ${id} only in compare URL`)
    }
  })

  // Check for differences in common components
  baseMap.forEach((baseComp, id) => {
    const compareComp = compareMap.get(id)
    if (compareComp !== undefined) {
      const componentDiffs = getObjectDiff(baseComp, compareComp)
      if (componentDiffs.length > 0) {
        differences.push(`Differences in Media Component ${id}:`)
        differences.push(...componentDiffs.map((diff) => `  ${diff}`))
      }
    }
  })

  return differences
}

function getObjectDiff(
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>
): string[] {
  const differences: string[] = []

  Object.keys(obj1).forEach((key) => {
    if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
      differences.push(
        `${key}: ${JSON.stringify(obj1[key])} !== ${JSON.stringify(obj2[key])}`
      )
    }
  })

  return differences
}
