import { randomUUID } from 'crypto'

import { ZodError } from 'zod'

import { prisma } from '@core/prisma/lumina/client'

import { stripe } from '../../../lib/stripe'
import { builder } from '../../builder'
import { ForbiddenError } from '../../error/ForbiddenError'
import { NotFoundError } from '../../error/NotFoundError'

import { TeamPlanCreateInput } from './inputs/createInput'
import { TeamPlanUpdateInput } from './inputs/updateInput'

builder.mutationField('luminaTeamPlanCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'TeamPlan',
    errors: { types: [ZodError] },
    args: { input: t.arg({ required: true, type: TeamPlanCreateInput }) },
    resolve: async (query, _parent, { input }, { currentUser }) => {
      const { teamId } = input
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { members: true }
      })
      if (!team)
        throw new NotFoundError('Team not found', [
          { path: ['luminaTeamPlanCreate', 'input', 'teamId'], value: teamId }
        ])
      if (
        !team.members.some(
          (member) =>
            member.userId === currentUser.id &&
            (member.role === 'OWNER' || member.role === 'MANAGER')
        )
      )
        throw new ForbiddenError(
          'You are not an owner or manager of the team',
          [{ path: ['luminaTeamPlanCreate', 'input', 'teamId'], value: teamId }]
        )

      const id = randomUUID()
      const stripeCustomer = await stripe.customers.create({
        email: input.billingEmail,
        name: input.billingName,
        address: {
          city: input.billingAddressCity,
          country: input.billingAddressCountry,
          line1: input.billingAddressLine1,
          line2: input.billingAddressLine2,
          postal_code: input.billingAddressPostalCode,
          state: input.billingAddressState
        },
        metadata: {
          user_id: id,
          env: process.env.NODE_ENV ?? 'development'
        }
      })

      return await prisma.teamPlan.create({
        ...query,
        data: {
          ...input,
          id,
          stripeCustomerId: stripeCustomer.id
        }
      })
    }
  })
)

builder.mutationField('luminaTeamPlanUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'TeamPlan',
    errors: { types: [ZodError] },
    args: { input: t.arg({ required: true, type: TeamPlanUpdateInput }) },
    resolve: async (query, _parent, { input }, { currentUser }) => {
      const { teamId, billingEmail, billingName } = input
      const teamPlan = await prisma.teamPlan.findUnique({
        where: { teamId },
        include: { team: { include: { members: true } } }
      })
      if (!teamPlan)
        throw new NotFoundError('Team plan not found', [
          { path: ['luminaTeamPlanUpdate', 'input', 'teamId'], value: teamId }
        ])
      if (
        !teamPlan.team.members.some(
          (member) =>
            member.userId === currentUser.id &&
            (member.role === 'OWNER' || member.role === 'MANAGER')
        )
      )
        throw new ForbiddenError(
          'You are not an owner or manager of the team',
          [{ path: ['luminaTeamPlanUpdate', 'input', 'teamId'], value: teamId }]
        )
      if (billingName !== undefined || billingEmail !== undefined) {
        await stripe.customers.update(teamPlan.stripeCustomerId, {
          name: billingName ?? teamPlan.billingName,
          email: billingEmail ?? teamPlan.billingEmail,
          address: {
            city:
              input.billingAddressCity ??
              teamPlan.billingAddressCity ??
              undefined,
            country:
              input.billingAddressCountry ??
              teamPlan.billingAddressCountry ??
              undefined,
            line1: input.billingAddressLine1 ?? teamPlan.billingAddressLine1,
            line2: input.billingAddressLine2 ?? teamPlan.billingAddressLine2,
            postal_code:
              input.billingAddressPostalCode ??
              teamPlan.billingAddressPostalCode,
            state: input.billingAddressState ?? teamPlan.billingAddressState
          }
        })
      }
      return await prisma.teamPlan.update({
        ...query,
        where: { id: teamPlan.id },
        data: {
          ...input,
          billingEmail: billingEmail ?? undefined,
          billingName: billingName ?? undefined
        }
      })
    }
  })
)
