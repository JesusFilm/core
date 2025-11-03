// Block resolver tests are in individual block type spec files

import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { MessagePlatform } from '../../../__generated__/graphql'

@Resolver('ChatOpenEvent')
export class ChatOpenEventResolver {
  @ResolveField('messagePlatform')
  messagePlatform(@Parent() event): MessagePlatform | undefined {
    return MessagePlatform[event.value]
  }
}
