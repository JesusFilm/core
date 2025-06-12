import { Prisma } from '.prisma/api-journeys-client'

import { cn } from './cn'

export function sanitizeClassNames(
  classNames: Prisma.JsonObject,
  existingClassNames?: Prisma.JsonObject
): Prisma.JsonObject {
  // parse through classNames keys and run cn on the value
  const sanitizedClassNames = Object.fromEntries(
    Object.entries(classNames as any).map(([key, value]) => [
      key,
      cn(
        existingClassNames ? (existingClassNames[key] as string) : '',
        value as string
      )
    ])
  )
  return sanitizedClassNames as Prisma.JsonObject
}
