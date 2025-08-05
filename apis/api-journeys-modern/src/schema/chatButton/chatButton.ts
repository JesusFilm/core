import { builder } from '../builder'
import { MessagePlatform } from '../enums'

export const ChatButtonRef = builder.prismaObject('ChatButton', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id'),
    link: t.exposeString('link'),
    platform: t.field({
      type: MessagePlatform,
      resolve: (chatButton) => chatButton.platform
    })
  })
})
