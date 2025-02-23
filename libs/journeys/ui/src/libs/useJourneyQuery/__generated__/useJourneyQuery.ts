import * as Types from '../../../../__generated__/types';

export type GetJourneyQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  idType?: Types.InputMaybe<Types.IdType>;
  options?: Types.InputMaybe<Types.JourneysQueryOptions>;
}>;


export type GetJourneyQuery = { __typename?: 'Query', journey: { __typename?: 'Journey', id: string, slug: string, title: string, description?: string | null, status: Types.JourneyStatus, createdAt: any, featuredAt?: any | null, publishedAt?: any | null, themeName: Types.ThemeName, themeMode: Types.ThemeMode, strategySlug?: string | null, seoTitle?: string | null, seoDescription?: string | null, template?: boolean | null, creatorDescription?: string | null, website?: boolean | null, showShareButton?: boolean | null, showLikeButton?: boolean | null, showDislikeButton?: boolean | null, displayTitle?: string | null, menuButtonIcon?: Types.JourneyMenuButtonIcon | null, language: { __typename?: 'Language', id: string, bcp47?: string | null, iso3?: string | null, name: Array<{ __typename?: 'LanguageName', value: string, primary: boolean }> }, blocks?: Array<{ __typename?: 'ButtonBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, label: string, size?: Types.ButtonSize | null, startIconId?: string | null, endIconId?: string | null, buttonVariant?: Types.ButtonVariant | null, buttonColor?: Types.ButtonColor | null, action?: { __typename?: 'EmailAction', email: string, parentBlockId: string, gtmEventName?: string | null } | { __typename?: 'LinkAction', url: string, parentBlockId: string, gtmEventName?: string | null } | { __typename?: 'NavigateToBlockAction', blockId: string, parentBlockId: string, gtmEventName?: string | null } | null } | { __typename?: 'CardBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, backgroundColor?: string | null, coverBlockId?: string | null, themeMode?: Types.ThemeMode | null, themeName?: Types.ThemeName | null, fullscreen: boolean } | { __typename?: 'GridContainerBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null } | { __typename?: 'GridItemBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null } | { __typename?: 'IconBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, iconName?: Types.IconName | null, iconSize?: Types.IconSize | null, iconColor?: Types.IconColor | null } | { __typename?: 'ImageBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, src?: string | null, alt: string, width: number, height: number, blurhash: string, scale?: number | null, focalTop?: number | null, focalLeft?: number | null } | { __typename?: 'RadioOptionBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, label: string, action?: { __typename?: 'EmailAction', email: string, parentBlockId: string, gtmEventName?: string | null } | { __typename?: 'LinkAction', url: string, parentBlockId: string, gtmEventName?: string | null } | { __typename?: 'NavigateToBlockAction', blockId: string, parentBlockId: string, gtmEventName?: string | null } | null } | { __typename?: 'RadioQuestionBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null } | { __typename?: 'SignUpBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, submitLabel?: string | null, submitIconId?: string | null, action?: { __typename?: 'EmailAction', email: string, parentBlockId: string, gtmEventName?: string | null } | { __typename?: 'LinkAction', url: string, parentBlockId: string, gtmEventName?: string | null } | { __typename?: 'NavigateToBlockAction', blockId: string, parentBlockId: string, gtmEventName?: string | null } | null } | { __typename?: 'SpacerBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, spacing?: number | null } | { __typename?: 'StepBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, locked: boolean, nextBlockId?: string | null, slug?: string | null } | { __typename?: 'TextResponseBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, label: string, hint?: string | null, minRows?: number | null, type?: Types.TextResponseType | null, routeId?: string | null, integrationId?: string | null } | { __typename?: 'TypographyBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, align?: Types.TypographyAlign | null, color?: Types.TypographyColor | null, content: string, variant?: Types.TypographyVariant | null } | { __typename?: 'VideoBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, muted?: boolean | null, autoplay?: boolean | null, startAt?: number | null, endAt?: number | null, posterBlockId?: string | null, fullsize?: boolean | null, videoId?: string | null, videoVariantLanguageId?: string | null, source: Types.VideoBlockSource, title?: string | null, description?: string | null, image?: string | null, duration?: number | null, objectFit?: Types.VideoBlockObjectFit | null, mediaVideo?: { __typename?: 'MuxVideo', id: string, assetId?: string | null, playbackId?: string | null } | { __typename?: 'Video', id: string, title: Array<{ __typename?: 'VideoTitle', value: string }>, images: Array<{ __typename?: 'CloudflareImage', mobileCinematicHigh?: string | null }>, variant?: { __typename?: 'VideoVariant', id: string, hls?: string | null } | null, variantLanguages: Array<{ __typename?: 'Language', id: string, name: Array<{ __typename?: 'LanguageName', value: string, primary: boolean }> }> } | { __typename?: 'YouTube', id: string } | null, action?: { __typename?: 'EmailAction', email: string, parentBlockId: string, gtmEventName?: string | null } | { __typename?: 'LinkAction', url: string, parentBlockId: string, gtmEventName?: string | null } | { __typename?: 'NavigateToBlockAction', blockId: string, parentBlockId: string, gtmEventName?: string | null } | null } | { __typename?: 'VideoTriggerBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, triggerStart: number, triggerAction: { __typename?: 'EmailAction', email: string, parentBlockId: string, gtmEventName?: string | null } | { __typename?: 'LinkAction', url: string, parentBlockId: string, gtmEventName?: string | null } | { __typename?: 'NavigateToBlockAction', blockId: string, parentBlockId: string, gtmEventName?: string | null } }> | null, primaryImageBlock?: { __typename?: 'ImageBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, src?: string | null, alt: string, width: number, height: number, blurhash: string, scale?: number | null, focalTop?: number | null, focalLeft?: number | null } | null, creatorImageBlock?: { __typename?: 'ImageBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, src?: string | null, alt: string, width: number, height: number, blurhash: string, scale?: number | null, focalTop?: number | null, focalLeft?: number | null } | null, userJourneys?: Array<{ __typename?: 'UserJourney', id: string, role: Types.UserJourneyRole, openedAt?: any | null, user?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, imageUrl?: string | null } | null }> | null, chatButtons: Array<{ __typename?: 'ChatButton', id: string, link?: string | null, platform?: Types.MessagePlatform | null }>, host?: { __typename?: 'Host', id: string, teamId: string, title: string, location?: string | null, src1?: string | null, src2?: string | null } | null, team?: { __typename?: 'Team', id: string, title: string, publicTitle?: string | null } | null, tags: Array<{ __typename?: 'Tag', id: string, parentId?: string | null, name: Array<{ __typename?: 'TagName', value: string, primary: boolean, language: { __typename?: 'Language', id: string } }> }>, logoImageBlock?: { __typename?: 'ImageBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, src?: string | null, alt: string, width: number, height: number, blurhash: string, scale?: number | null, focalTop?: number | null, focalLeft?: number | null } | null, menuStepBlock?: { __typename?: 'StepBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, locked: boolean, nextBlockId?: string | null, slug?: string | null } | null } };
