import * as Types from '../../../../__generated__/globalTypes';

export type BlockFields_ButtonBlock_Fragment = { __typename: 'ButtonBlock', id: string, parentBlockId: string | null, parentOrder: number | null, label: string, size: Types.ButtonSize | null, startIconId: string | null, endIconId: string | null, buttonVariant: Types.ButtonVariant | null, buttonColor: Types.ButtonColor | null, action: { __typename: 'EmailAction', email: string, parentBlockId: string, gtmEventName: string | null } | { __typename: 'LinkAction', url: string, parentBlockId: string, gtmEventName: string | null } | { __typename: 'NavigateToBlockAction', blockId: string, parentBlockId: string, gtmEventName: string | null } | null };

export type BlockFields_CardBlock_Fragment = { __typename: 'CardBlock', id: string, parentBlockId: string | null, parentOrder: number | null, backgroundColor: string | null, coverBlockId: string | null, themeMode: Types.ThemeMode | null, themeName: Types.ThemeName | null, fullscreen: boolean };

export type BlockFields_GridContainerBlock_Fragment = { __typename: 'GridContainerBlock', id: string, parentBlockId: string | null, parentOrder: number | null };

export type BlockFields_GridItemBlock_Fragment = { __typename: 'GridItemBlock', id: string, parentBlockId: string | null, parentOrder: number | null };

export type BlockFields_IconBlock_Fragment = { __typename: 'IconBlock', id: string, parentBlockId: string | null, parentOrder: number | null, iconName: Types.IconName | null, iconSize: Types.IconSize | null, iconColor: Types.IconColor | null };

export type BlockFields_ImageBlock_Fragment = { __typename: 'ImageBlock', id: string, parentBlockId: string | null, parentOrder: number | null, src: string | null, alt: string, width: number, height: number, blurhash: string, scale: number | null, focalTop: number | null, focalLeft: number | null };

export type BlockFields_RadioOptionBlock_Fragment = { __typename: 'RadioOptionBlock', id: string, parentBlockId: string | null, parentOrder: number | null, label: string, action: { __typename: 'EmailAction', email: string, parentBlockId: string, gtmEventName: string | null } | { __typename: 'LinkAction', url: string, parentBlockId: string, gtmEventName: string | null } | { __typename: 'NavigateToBlockAction', blockId: string, parentBlockId: string, gtmEventName: string | null } | null };

export type BlockFields_RadioQuestionBlock_Fragment = { __typename: 'RadioQuestionBlock', id: string, parentBlockId: string | null, parentOrder: number | null };

export type BlockFields_SignUpBlock_Fragment = { __typename: 'SignUpBlock', id: string, parentBlockId: string | null, parentOrder: number | null, submitLabel: string | null, submitIconId: string | null, action: { __typename: 'EmailAction', email: string, parentBlockId: string, gtmEventName: string | null } | { __typename: 'LinkAction', url: string, parentBlockId: string, gtmEventName: string | null } | { __typename: 'NavigateToBlockAction', blockId: string, parentBlockId: string, gtmEventName: string | null } | null };

export type BlockFields_SpacerBlock_Fragment = { __typename: 'SpacerBlock', id: string, parentBlockId: string | null, parentOrder: number | null, spacing: number | null };

export type BlockFields_StepBlock_Fragment = { __typename: 'StepBlock', id: string, parentBlockId: string | null, parentOrder: number | null, locked: boolean, nextBlockId: string | null, slug: string | null };

export type BlockFields_TextResponseBlock_Fragment = { __typename: 'TextResponseBlock', id: string, parentBlockId: string | null, parentOrder: number | null, label: string, hint: string | null, minRows: number | null, type: Types.TextResponseType | null, routeId: string | null, integrationId: string | null };

export type BlockFields_TypographyBlock_Fragment = { __typename: 'TypographyBlock', id: string, parentBlockId: string | null, parentOrder: number | null, align: Types.TypographyAlign | null, color: Types.TypographyColor | null, content: string, variant: Types.TypographyVariant | null };

export type BlockFields_VideoBlock_Fragment = { __typename: 'VideoBlock', id: string, parentBlockId: string | null, parentOrder: number | null, muted: boolean | null, autoplay: boolean | null, startAt: number | null, endAt: number | null, posterBlockId: string | null, fullsize: boolean | null, videoId: string | null, videoVariantLanguageId: string | null, source: Types.VideoBlockSource, title: string | null, description: string | null, image: string | null, duration: number | null, objectFit: Types.VideoBlockObjectFit | null, mediaVideo: { __typename: 'MuxVideo', id: string, assetId: string | null, playbackId: string | null } | { __typename: 'Video', id: string, title: Array<{ __typename: 'VideoTitle', value: string }>, images: Array<{ __typename: 'CloudflareImage', mobileCinematicHigh: string | null }>, variant: { __typename: 'VideoVariant', id: string, hls: string | null } | null, variantLanguages: Array<{ __typename: 'Language', id: string, name: Array<{ __typename: 'LanguageName', value: string, primary: boolean }> }> } | { __typename: 'YouTube', id: string } | null, action: { __typename: 'EmailAction', email: string, parentBlockId: string, gtmEventName: string | null } | { __typename: 'LinkAction', url: string, parentBlockId: string, gtmEventName: string | null } | { __typename: 'NavigateToBlockAction', blockId: string, parentBlockId: string, gtmEventName: string | null } | null };

export type BlockFields_VideoTriggerBlock_Fragment = { __typename: 'VideoTriggerBlock', id: string, parentBlockId: string | null, parentOrder: number | null, triggerStart: number, triggerAction: { __typename: 'EmailAction', email: string, parentBlockId: string, gtmEventName: string | null } | { __typename: 'LinkAction', url: string, parentBlockId: string, gtmEventName: string | null } | { __typename: 'NavigateToBlockAction', blockId: string, parentBlockId: string, gtmEventName: string | null } };

export type BlockFieldsFragment = BlockFields_ButtonBlock_Fragment | BlockFields_CardBlock_Fragment | BlockFields_GridContainerBlock_Fragment | BlockFields_GridItemBlock_Fragment | BlockFields_IconBlock_Fragment | BlockFields_ImageBlock_Fragment | BlockFields_RadioOptionBlock_Fragment | BlockFields_RadioQuestionBlock_Fragment | BlockFields_SignUpBlock_Fragment | BlockFields_SpacerBlock_Fragment | BlockFields_StepBlock_Fragment | BlockFields_TextResponseBlock_Fragment | BlockFields_TypographyBlock_Fragment | BlockFields_VideoBlock_Fragment | BlockFields_VideoTriggerBlock_Fragment;
