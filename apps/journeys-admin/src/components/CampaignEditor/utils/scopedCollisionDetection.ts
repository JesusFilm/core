import {
  CollisionDetection,
  DroppableContainer,
  closestCenter,
  pointerWithin
} from '@dnd-kit/core'

/**
 * A collision detection over the droppables `scope` keeps: the one under the
 * pointer, else the nearest centre (at a list's edges). Shared by the canvas
 * and the Navigator, whose scopes keep a drag among its own kind.
 */
export function scopedCollisionDetection(
  scope: (args: Parameters<CollisionDetection>[0]) => DroppableContainer[]
): CollisionDetection {
  return (args) => {
    const scoped = { ...args, droppableContainers: scope(args) }
    const within = pointerWithin(scoped)
    return within.length > 0 ? within : closestCenter(scoped)
  }
}
