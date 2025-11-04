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
    errors: { types: [NotFoundError, ForbiddenError, ZodError] },
    args: { input: t.arg({ required: true, type: TeamPlanCreateInput }) },
    resolve: async (query, _parent, { input }, { user }) => {
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
            member.userId === user.id &&
            (member.role === 'OWNER' || member.role === 'MANAGER')
        )
      )
        throw new ForbiddenError(
          'You are not an owner or manager of the team',
          [{ path: ['luminaTeamPlanCreate', 'input', 'teamId'], value: teamId }]
        )

      const id = randomUUID()
      const stripeCustomer = await stripe.customers.create(
        {
          email: input.billingEmail,
          name: input.billingName,
          address: {
            city: input.billingAddressCity ?? undefined,
            country: input.billingAddressCountry ?? undefined,
            line1: input.billingAddressLine1 ?? undefined,
            line2: input.billingAddressLine2 ?? undefined,
            postal_code: input.billingAddressPostalCode ?? undefined,
            state: input.billingAddressState ?? undefined
          },
          metadata: {
            teamPlanId: id,
            teamId: teamId,
            userId: user.id,
            env: process.env.NODE_ENV ?? null
          }
        },
        undefined
      )

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
    errors: { types: [NotFoundError, ForbiddenError, ZodError] },
    args: { input: t.arg({ required: true, type: TeamPlanUpdateInput }) },
    resolve: async (query, _parent, { input }, { user }) => {
      const { teamId } = input
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
            member.userId === user.id &&
            (member.role === 'OWNER' || member.role === 'MANAGER')
        )
      )
        throw new ForbiddenError(
          'You are not an owner or manager of the team',
          [{ path: ['luminaTeamPlanUpdate', 'input', 'teamId'], value: teamId }]
        )
      if (
        [
          input.billingName,
          input.billingEmail,
          input.billingAddressCity,
          input.billingAddressCountry,
          input.billingAddressLine1,
          input.billingAddressLine2,
          input.billingAddressPostalCode,
          input.billingAddressState
        ].some(Boolean)
      ) {
        await stripe.customers.update(teamPlan.stripeCustomerId, {
          name: input.billingName ?? teamPlan.billingName,
          email: input.billingEmail ?? teamPlan.billingEmail,
          address: {
            city:
              input.billingAddressCity ??
              teamPlan.billingAddressCity ??
              undefined,
            country:
              input.billingAddressCountry ??
              teamPlan.billingAddressCountry ??
              undefined,
            line1:
              input.billingAddressLine1 ??
              teamPlan.billingAddressLine1 ??
              undefined,
            line2:
              input.billingAddressLine2 ??
              teamPlan.billingAddressLine2 ??
              undefined,
            postal_code:
              input.billingAddressPostalCode ??
              teamPlan.billingAddressPostalCode ??
              undefined,
            state:
              input.billingAddressState ??
              teamPlan.billingAddressState ??
              undefined
          }
        })
      }
      return await prisma.teamPlan.update({
        ...query,
        where: { id: teamPlan.id },
        data: {
          ...input,
          billingEmail: input.billingEmail ?? undefined,
          billingName: input.billingName ?? undefined
        }
      })
    }
  })
)
