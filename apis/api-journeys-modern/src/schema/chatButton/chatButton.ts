import { builder } from '../builder'
import { MessagePlatform } from '../enums'

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
