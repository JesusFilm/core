import type { Journey } from '../journeySchema'
import type { Plan } from '../stages/stageSchemas'

type EditPlan = Extract<Plan, { kind: 'edit' }>

function structuralChanges(plan: EditPlan, before: Journey) {
  const existing = new Set(before.steps.map((step) => step.name))
  return {
    added: new Set(
      plan.changes
        .filter((change) => change.op === 'add' && !existing.has(change.step))
        .map((change) => change.step)
    ),
    removed: new Set(
      plan.changes
        .filter((change) => change.op === 'remove' && existing.has(change.name))
        .map((change) => change.name)
    ),
    moved: new Set(
      plan.changes
        .filter((change) => change.op === 'move' && existing.has(change.name))
        .map((change) => change.name)
    )
  }
}

/** A styling follow-up cannot authorize a new first card, even if the planner invents one. */
export function checkPlanScope(plan: Plan, before: Journey | null): string[] {
  if (before == null) return []
  if (plan.kind !== 'edit')
    return [
      'Edit the current journey instead of replacing it with a new journey.'
    ]
  if (plan.allowStepChanges === true) return []
  const { added, removed, moved } = structuralChanges(plan, before)
  if (added.size + removed.size + moved.size === 0) return []
  return [
    'This request edits existing cards only. Do not add, remove or reorder steps. Resolve ordinal references such as first card against the current journey; change that card in place.'
  ]
}

/** Reject unplanned steps/order changes before accepting the builder's complete replacement JSON. */
export function checkStepStructure(
  before: Journey,
  after: Journey,
  plan: EditPlan
): string[] {
  const planErrors = checkPlanScope(plan, before)
  if (planErrors.length > 0) return planErrors
  const { added, removed, moved } = structuralChanges(plan, before)
  const expected = new Set([
    ...before.steps
      .filter((step) => !removed.has(step.name))
      .map((step) => step.name),
    ...added
  ])
  const actual = new Set(after.steps.map((step) => step.name))
  const errors: string[] = []
  for (const name of actual)
    if (!expected.has(name))
      errors.push(
        `Unplanned new step \`${name}\`. Remove it; edit the existing target card in place.`
      )
  for (const name of expected)
    if (!actual.has(name))
      errors.push(
        `Missing planned step \`${name}\`. Preserve existing cards unless their removal was planned.`
      )
  const existingUnmoved = before.steps
    .filter((step) => !removed.has(step.name) && !moved.has(step.name))
    .map((step) => step.name)
  const unchangedNames = new Set(existingUnmoved)
  const actualUnmoved = after.steps
    .filter((step) => unchangedNames.has(step.name))
    .map((step) => step.name)
  if (existingUnmoved.join(',') !== actualUnmoved.join(','))
    errors.push(
      'Existing cards were reordered without a planned move. Preserve their original order.'
    )
  return errors
}
