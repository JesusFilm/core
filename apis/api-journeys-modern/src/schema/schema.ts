// Developers must add an import for every resolver
// and object type in the schema

import './journeyAiTranslate'
import './mediaVideo'
import './journeyEventsExportLog'
import './userNotifications'
import 'reflect-metadata'

import { builder } from './builder'

export const schema = builder.toSubGraphSchema({
  linkUrl: 'https://specs.apollo.dev/federation/v2.6'
})

builder.queryType()
builder.mutationType()
builder.subscriptionType()

// Force generation of Journey type in schema
builder.prismaObject('Journey', {
  description: 'A Journey',
  findUnique: (journey) => ({ id: journey.id }),
  fields: (t) => ({
    id: t.exposeID('id')
  })
})
