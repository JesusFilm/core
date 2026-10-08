import { isDeepStrictEqual } from 'node:util'

import type { Journey } from '../journeySchema'

/**
 * Returns the names of steps the plan said to keep that came back changed or
 * missing. It only flags (ENG-3767 decision 3); it never undoes the change.
 * Run it after `resolveImages`, which restores a src the builder dropped from
 * an unchanged image, so that drop is not counted as a change.
 */
export function scopeCheck(
  before: Journey,
  after: Journey,
  keep: string[]
): string[] {
  const afterSteps = new Map(after.steps.map((step) => [step.name, step]))
  return keep.filter((name) => {
    const old = before.steps.find((step) => step.name === name)
    if (old == null) return false
    const next = afterSteps.get(name)
    return next == null || !isDeepStrictEqual(old, next)
  })
}
