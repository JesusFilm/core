import { ThemeMode } from '../../block/card/enums/themeMode'
import { ThemeName } from '../../block/card/enums/themeName'
import { builder } from '../../builder'
import { JourneyMenuButtonIcon } from '../enums'

// JourneyMenuButtonIcon enum moved to ../enums/journeyMenuButtonIcon.ts

export const JourneyUpdateInput = builder.inputType('JourneyUpdateInput', {
  fields: (t) => ({
    title: t.string({ required: false }),
    languageId: t.string({ required: false }),
    themeMode: t.field({ type: ThemeMode, required: false }),
    themeName: t.field({ type: ThemeName, required: false }),
    description: t.string({ required: false }),
    creatorDescription: t.string({ required: false }),
    creatorImageBlockId: t.id({ required: false }),
    primaryImageBlockId: t.id({ required: false }),
    slug: t.string({ required: false }),
    seoTitle: t.string({ required: false }),
    seoDescription: t.string({ required: false }),
    hostId: t.string({ required: false }),
    strategySlug: t.string({ required: false }),
    tagIds: t.idList({ required: false }),
    website: t.boolean({ required: false }),
    showShareButton: t.boolean({ required: false }),
    showLikeButton: t.boolean({ required: false }),
    showDislikeButton: t.boolean({ required: false }),
    displayTitle: t.string({ required: false }),
    showHosts: t.boolean({ required: false }),
    showChatButtons: t.boolean({ required: false }),
    showReactionButtons: t.boolean({ required: false }),
    showLogo: t.boolean({ required: false }),
    showMenu: t.boolean({ required: false }),
    showDisplayTitle: t.boolean({ required: false }),
    showAssistant: t.boolean({ required: false }),
    menuButtonIcon: t.field({
      type: JourneyMenuButtonIcon,
      required: false
    }),
    menuStepBlockId: t.id({ required: false }),
    logoImageBlockId: t.id({ required: false }),
    socialNodeX: t.int({ required: false }),
    socialNodeY: t.int({ required: false })
  })
})
