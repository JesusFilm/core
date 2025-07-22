import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { MessagePlatform } from '../enums'

const ChatButtonCreateInput = builder.inputType('ChatButtonCreateInput', {
  fields: (t) => ({
    link: t.string({ required: true }),
    platform: t.field({ type: MessagePlatform, required: true })
  })
})

const ChatButtonUpdateInput = builder.inputType('ChatButtonUpdateInput', {
  fields: (t) => ({
    link: t.string({ required: true }),
    platform: t.field({ type: MessagePlatform, required: true })
  })
})

const ChatButtonRef = builder.prismaObject('ChatButton', {
  fields: (t) => ({
    id: t.exposeID('id'),
    link: t.exposeString('link'),
    platform: t.field({
      type: MessagePlatform,
      resolve: (chatButton) => chatButton.platform
    })
  })
})

builder.mutationFields((t) => ({
  chatButtonCreate: t.withAuth({ isAuthenticated: true }).prismaField({
    type: ChatButtonRef,
    args: {
      journeyId: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: ChatButtonCreateInput, required: true })
    },
    resolve: async (query, _parent, { input, journeyId }) => {
      const chatButtons = await prisma.chatButton.findMany({
        where: { journeyId }
      })

      if (chatButtons.length < 2) {
        return await prisma.chatButton.create({
          ...query,
          data: {
            journeyId,
            ...input
          }
        })
      } else {
        throw new Error(
          'There are already 2 chat buttons associated with the given journey'
        )
      }
    }
  }),
  chatButtonUpdate: t.withAuth({ isAuthenticated: true }).prismaField({
    type: ChatButtonRef,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      journeyId: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: ChatButtonUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input, journeyId, id }) => {
      return await prisma.chatButton.update({
        ...query,
        where: { id },
        data: { journeyId, ...input }
      })
    }
  }),
  chatButtonRemove: t.withAuth({ isAuthenticated: true }).prismaField({
    type: ChatButtonRef,
    args: { id: t.arg({ type: 'ID', required: true }) },
    resolve: async (query, _parent, { id }) => {
      return await prisma.chatButton.delete({ ...query, where: { id } })
    }
  })
}))
