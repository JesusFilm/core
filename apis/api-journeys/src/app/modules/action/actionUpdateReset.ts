import { Prisma } from '@core/prisma/journeys/client'

/**
 * ACTION_UPDATE_RESET should be used to reset an action when performing
 * a prismaService.action update as actions are polymorphic (that is they
 * determine their type based on what fields are not null).
 */
export const ACTION_UPDATE_RESET: Prisma.ActionUpdateInput = {
  url: null,
  target: null,
  email: null,
  phone: null,
  journey: { disconnect: true },
  block: { disconnect: true }
}
