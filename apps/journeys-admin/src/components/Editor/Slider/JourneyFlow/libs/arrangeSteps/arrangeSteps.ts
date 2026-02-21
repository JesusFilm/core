import findIndex from 'lodash/findIndex'
import reduce from 'lodash/reduce'
import { Edge, XYPosition } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { filterActionBlocks } from '@core/journeys/ui/filterActionBlocks'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import {
  ACTION_BUTTON_HEIGHT,
  LINK_NODE_WIDTH_GAP_RIGHT,
  STEP_NODE_CARD_HEIGHT,
  STEP_NODE_CARD_WIDTH,
  STEP_NODE_HEIGHT_GAP,
  STEP_NODE_OFFSET,
  STEP_NODE_WIDTH_GAP
} from '../../nodes/StepBlockNode/libs/sizes'

export interface PositionMap {
  [id: string]: XYPosition
}

type TreeStepBlock = TreeBlock<StepBlock>

export function arrangeSteps(
  steps: TreeStepBlock[],
  edges?: Edge[]
): PositionMap {
  const positions: PositionMap = {}
  const blocks: TreeStepBlock[][] = []

  const stepIds = new Set(steps.map((s) => s.id))

  const stepToStepEdges =
    edges != null
      ? edges.filter((e) => stepIds.has(e.source) && stepIds.has(e.target))
      : []

  const nonTargetSteps: TreeStepBlock[] =
    stepToStepEdges.length > 0
      ? steps.filter(
          (s) => !stepToStepEdges.some((edge) => edge.target === s.id)
        )
      : []

  const unvisitedStepIds: string[] = steps
    .filter((step) => !nonTargetSteps.some((s) => s.id === step.id))
    .map((step) => step.id)

  function visitStepId(id?: string): TreeStepBlock | undefined {
    if (id == null) return
    const index = unvisitedStepIds.indexOf(id)
    if (index < 0) return
    unvisitedStepIds.splice(index, 1)
    return steps.find((step) => step.id === id)
  }

  function getNextStep(step: TreeStepBlock): TreeStepBlock | undefined {
    const index = findIndex(steps, (child) => child.id === step.id)
    if (index < 0) return
    if (step.nextBlockId == null && steps[index + 1] != null)
      return visitStepId(steps[index + 1].id)
    if (step.nextBlockId != null && step.nextBlockId !== step.id)
      return visitStepId(step.nextBlockId)
  }

  function getDescendantStepsOfStep(step: TreeStepBlock): TreeStepBlock[] {
    const descendants: TreeStepBlock[] = []
    const nextStep = getNextStep(step)
    if (nextStep != null) descendants.push(nextStep)

    const blocks = filterActionBlocks(step)

    blocks.forEach((child) => {
      if (child.action?.__typename === 'NavigateToBlockAction') {
        const nextStep = visitStepId(child.action?.blockId)
        if (nextStep != null) descendants.push(nextStep)
      }
    })
    return descendants
  }

  function processSteps(steps: TreeStepBlock[]): void {
    blocks.push(steps)
    const descendants = steps.flatMap((step) => {
      return getDescendantStepsOfStep(step)
    })
    if (descendants.length > 0) processSteps(descendants)
  }

  function buildSourceToTargetsMap(stepEdges: Edge[]): Map<string, string[]> {
    const map = new Map<string, string[]>()
    stepEdges.forEach((edge) => {
      const list = map.get(edge.source) ?? []
      list.push(edge.target)
      map.set(edge.source, list)
    })
    return map
  }

  function buildBlocksByEdgeTraversal(stepEdges: Edge[]): void {
    const sourceToTargets = buildSourceToTargetsMap(stepEdges)
    const placedIds = new Set<string>()

    function processLevel(levelSteps: TreeStepBlock[]): void {
      blocks.push(levelSteps)
      levelSteps.forEach((s) => placedIds.add(s.id))
      const nextIds = levelSteps.flatMap((s) => sourceToTargets.get(s.id) ?? [])
      const uniqueNextIds = [...new Set(nextIds)].filter(
        (id) => !placedIds.has(id)
      )
      const nextSteps = uniqueNextIds
        .map((id) => steps.find((s) => s.id === id))
        .filter((s): s is TreeStepBlock => s != null)
      if (nextSteps.length > 0) processLevel(nextSteps)
    }

    if (nonTargetSteps.length > 0) processLevel(nonTargetSteps)
    else if (steps[0] != null) processLevel([steps[0]])
  }

  function buildBlocksByStructureTraversal(): void {
    while (unvisitedStepIds.length > 0) {
      const step = visitStepId(unvisitedStepIds[0])
      if (step != null) processSteps([step])
    }
  }

  function finalizeBlocks(): void {
    const nonTargetIds = new Set(nonTargetSteps.map((s) => s.id))
    if (
      blocks.length > 1 &&
      blocks.every((column) => column.length === 1) &&
      (nonTargetIds.size === 0 ||
        blocks.flat().every((step) => nonTargetIds.has(step.id)))
    ) {
      blocks.splice(0, blocks.length, blocks.flat())
    }

    const placedIds = new Set(blocks.flat().map((s) => s.id))

    function processLoopLevel(
      levelSteps: TreeStepBlock[],
      sourceToTargets: Map<string, string[]>,
      currentRemaining: TreeStepBlock[],
      loopPlacedIds: Set<string>,
      loopBlocks: TreeStepBlock[][]
    ): void {
      loopBlocks.push(levelSteps)
      levelSteps.forEach((s) => loopPlacedIds.add(s.id))
      const nextIds = levelSteps.flatMap((s) => sourceToTargets.get(s.id) ?? [])
      const uniqueNextIds = [...new Set(nextIds)].filter(
        (id) =>
          !loopPlacedIds.has(id) && currentRemaining.some((u) => u.id === id)
      )
      const nextSteps = uniqueNextIds
        .map((id) => steps.find((s) => s.id === id))
        .filter((s): s is TreeStepBlock => s != null)
      if (nextSteps.length > 0)
        processLoopLevel(
          nextSteps,
          sourceToTargets,
          currentRemaining,
          loopPlacedIds,
          loopBlocks
        )
    }

    const unplacedSteps = steps.filter((s) => !placedIds.has(s.id))
    if (unplacedSteps.length > 0) {
      if (stepToStepEdges.length > 0) {
        const sourceToTargets = buildSourceToTargetsMap(stepToStepEdges)
        let remainingUnplaced = [...unplacedSteps]

        while (remainingUnplaced.length > 0) {
          const currentRemaining = remainingUnplaced
          const loopPlacedIds = new Set<string>()
          const loopBlocks: TreeStepBlock[][] = []

          processLoopLevel(
            [remainingUnplaced[0]],
            sourceToTargets,
            currentRemaining,
            loopPlacedIds,
            loopBlocks
          )
          blocks.push(...loopBlocks)
          remainingUnplaced = remainingUnplaced.filter(
            (s) => !loopPlacedIds.has(s.id)
          )
        }
      } else {
        if (blocks.length > 0) {
          blocks[0] = [...unplacedSteps, ...blocks[0]]
        } else {
          blocks[0] = unplacedSteps
        }
      }
    }
  }

  if (stepToStepEdges.length > 0) {
    buildBlocksByEdgeTraversal(stepToStepEdges)
  } else {
    buildBlocksByStructureTraversal()
  }

  finalizeBlocks()

  blocks.reduce((prevActionBlock, column, index) => {
    const stepX = index * (STEP_NODE_CARD_WIDTH + STEP_NODE_WIDTH_GAP)

    reduce<TreeStepBlock, TreeStepBlock | null>(
      column,
      (result, step) => {
        let stepY = STEP_NODE_OFFSET
        if (result != null) {
          stepY =
            positions[result.id].y +
            (filterActionBlocks(result).length + 1) * ACTION_BUTTON_HEIGHT +
            STEP_NODE_CARD_HEIGHT +
            STEP_NODE_HEIGHT_GAP
        }
        positions[step.id] = {
          x: stepX,
          y: stepY
        }
        return step
      },
      null
    )

    return filterActionBlocks(column[column.length - 1]).length > 0
  }, false)

  return positions
}
