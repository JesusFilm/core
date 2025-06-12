import { Prisma } from '.prisma/api-journeys-client'

import { cn } from './cn'

export function sanitizeClassNames(
  classNames: Prisma.JsonObject,
  existingClassNames?: Prisma.JsonObject
): Prisma.JsonObject {
  // parse through classNames keys and run cn on the value
  const sanitizedUpdate = Object.fromEntries(
    Object.entries(classNames as Record<string, unknown>).map(
      ([key, value]) => [
        key,
        cn(
          existingClassNames ? (existingClassNames[key] as string) : '',
          value as string
        )
      ]
    )
  )

  return {
    ...(existingClassNames ?? {}),
    ...sanitizedUpdate
  } as Prisma.JsonObject
}
