import { Prisma } from '@core/prisma/journeys/client'

/**
 * The two ways Prisma reports which columns a P2002 hit: the classic engine
 * in `meta.target`, a driver adapter (what production runs) in its
 * constraint's `fields`.
 */
export const UNIQUE_VIOLATION_SHAPES = [
  'classic engine',
  'driver adapter'
] as const

export type UniqueViolationShape = (typeof UNIQUE_VIOLATION_SHAPES)[number]

/** A unique violation (P2002) on `fields`, reported in `shape`. */
export function uniqueViolation(
  shape: UniqueViolationShape,
  fields: string[]
): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
    meta:
      shape === 'classic engine'
        ? { target: fields }
        : {
            driverAdapterError: {
              cause: {
                kind: 'UniqueConstraintViolation',
                constraint: { fields }
              }
            }
          }
  })
}
