import { isDeepStrictEqual } from 'node:util'

import type { Journey } from '../journeySchema'

/**
 * Returns the names of steps the plan said to keep that came back changed or
 * missing. It only flags (ENG-3767 decision 3); `restoreKeptSteps` has
 * already put back every kept step it could, so what is left here is a kept
 * step that could not be restored without invalidating the journey.
 * Run it after `resolveImages`, which puts the photo back on every unchanged
 * image, so the model's search-and-alt view is not counted as a change.
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

/**
 * Puts back the previous version of every step the plan said to keep, so a
 * kept step is never retyped by the model (it rewrites quotes and the like
 * when it copies). Missing kept steps are restored beside unchanged neighbors,
 * preserving intentional moves of edited steps. `before` is not shared with it.
 */
export function restoreKeptSteps(
  after: Journey,
  before: Journey,
  keep: string[]
): Journey {
  const kept = new Set(keep)
  const beforeSteps = new Map(before.steps.map((step) => [step.name, step]))
  const steps = after.steps.map((step) => {
    const old = kept.has(step.name) ? beforeSteps.get(step.name) : undefined
    return old != null ? structuredClone(old) : step
  })
  const present = new Set(steps.map((step) => step.name))
  before.steps.forEach((step, index) => {
    if (!kept.has(step.name) || present.has(step.name)) return
    const nextAnchor = before.steps
      .slice(index + 1)
      .find(
        (candidate) => kept.has(candidate.name) && present.has(candidate.name)
      )
    const previousAnchor = before.steps
      .slice(0, index)
      .reverse()
      .find(
        (candidate) => kept.has(candidate.name) && present.has(candidate.name)
      )
    const insertionIndex =
      nextAnchor != null
        ? steps.findIndex((candidate) => candidate.name === nextAnchor.name)
        : previousAnchor != null
          ? steps.findIndex(
              (candidate) => candidate.name === previousAnchor.name
            ) + 1
          : Math.min(index, steps.length)
    steps.splice(insertionIndex, 0, structuredClone(step))
    present.add(step.name)
  })
  return { ...after, steps }
}
