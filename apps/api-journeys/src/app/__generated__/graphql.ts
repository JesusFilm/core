
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum ThemeMode {
    dark = "dark",
    light = "light"
}

export enum ThemeName {
    base = "base"
}

export enum ButtonVariant {
    text = "text",
    contained = "contained"
}

export enum ButtonColor {
    primary = "primary",
    secondary = "secondary",
    error = "error",
    inherit = "inherit"
}

export enum ButtonSize {
    small = "small",
    medium = "medium",
    large = "large"
}

export enum GridDirection {
    columnReverse = "columnReverse",
    column = "column",
    row = "row",
    rowReverse = "rowReverse"
}

export enum GridJustifyContent {
    flexStart = "flexStart",
    flexEnd = "flexEnd",
    center = "center"
}

export enum GridAlignItems {
    baseline = "baseline",
    flexStart = "flexStart",
    flexEnd = "flexEnd",
    center = "center"
}

export enum IconName {
    PlayArrowRounded = "PlayArrowRounded",
    TranslateRounded = "TranslateRounded",
    CheckCircleRounded = "CheckCircleRounded",
    RadioButtonUncheckedRounded = "RadioButtonUncheckedRounded",
    FormatQuoteRounded = "FormatQuoteRounded",
    LockOpenRounded = "LockOpenRounded",
    ArrowForwardRounded = "ArrowForwardRounded",
    ArrowBackRounded = "ArrowBackRounded",
    ChatBubbleOutlineRounded = "ChatBubbleOutlineRounded",
    LiveTvRounded = "LiveTvRounded",
    MenuBookRounded = "MenuBookRounded",
    ChevronRightRounded = "ChevronRightRounded",
    ChevronLeftRounded = "ChevronLeftRounded",
    BeenhereRounded = "BeenhereRounded",
    SendRounded = "SendRounded",
    SubscriptionsRounded = "SubscriptionsRounded",
    ContactSupportRounded = "ContactSupportRounded"
}

export enum IconColor {
    primary = "primary",
    secondary = "secondary",
    action = "action",
    error = "error",
    disabled = "disabled",
    inherit = "inherit"
}

export enum IconSize {
    sm = "sm",
    md = "md",
    lg = "lg",
    xl = "xl",
    inherit = "inherit"
}

export enum TypographyVariant {
    h1 = "h1",
    h2 = "h2",
    h3 = "h3",
    h4 = "h4",
    h5 = "h5",
    h6 = "h6",
    subtitle1 = "subtitle1",
    subtitle2 = "subtitle2",
    body1 = "body1",
    body2 = "body2",
    caption = "caption",
    overline = "overline"
}

export enum TypographyColor {
    primary = "primary",
    secondary = "secondary",
    error = "error"
}

export enum TypographyAlign {
    left = "left",
    center = "center",
    right = "right"
}

export enum VideoBlockSource {
    internal = "internal",
    youTube = "youTube",
    cloudflare = "cloudflare"
}

export enum VideoBlockObjectFit {
    fill = "fill",
    fit = "fit",
    zoomed = "zoomed"
}

export enum ChatPlatform {
    facebook = "facebook",
    telegram = "telegram",
    whatsApp = "whatsApp",
    instagram = "instagram",
    viber = "viber",
    vk = "vk",
    snapchat = "snapchat",
    skype = "skype",
    line = "line",
    tikTok = "tikTok",
    custom = "custom"
}

export enum ButtonAction {
    NavigateAction = "NavigateAction",
    NavigateToBlockAction = "NavigateToBlockAction",
    NavigateToJourneyAction = "NavigateToJourneyAction",
    LinkAction = "LinkAction",
    EmailAction = "EmailAction"
}

export enum MessagePlatform {
    facebook = "facebook",
    telegram = "telegram",
    whatsApp = "whatsApp",
    instagram = "instagram",
    viber = "viber",
    vk = "vk",
    snapchat = "snapchat",
    skype = "skype",
    line = "line",
    tikTok = "tikTok",
    custom = "custom"
}

export enum IdType {
    databaseId = "databaseId",
    slug = "slug"
}

export enum JourneyStatus {
    archived = "archived",
    deleted = "deleted",
    draft = "draft",
    published = "published",
    trashed = "trashed"
}

export enum JourneysReportType {
    multipleFull = "multipleFull",
    multipleSummary = "multipleSummary",
    singleFull = "singleFull",
    singleSummary = "singleSummary"
}

export enum JourneyVisitorSort {
    date = "date",
    duration = "duration",
    activity = "activity"
}

export enum UserJourneyRole {
    inviteRequested = "inviteRequested",
    editor = "editor",
    owner = "owner"
}

export enum Role {
    publisher = "publisher"
}

export enum UserTeamRole {
    manager = "manager",
    member = "member"
}

export enum DeviceType {
    console = "console",
    mobile = "mobile",
    tablet = "tablet",
    smarttv = "smarttv",
    wearable = "wearable",
    embedded = "embedded"
}

export enum VisitorStatus {
    star = "star",
    prohibited = "prohibited",
    checkMarkSymbol = "checkMarkSymbol",
    thumbsUp = "thumbsUp",
    thumbsDown = "thumbsDown",
    partyPopper = "partyPopper",
    warning = "warning",
    robotFace = "robotFace",
    redExclamationMark = "redExclamationMark",
    redQuestionMark = "redQuestionMark"
}

export class NavigateActionInput {
    gtmEventName?: Nullable<string>;
}

export class NavigateToBlockActionInput {
    gtmEventName?: Nullable<string>;
    blockId: string;
}

export class NavigateToJourneyActionInput {
    gtmEventName?: Nullable<string>;
    journeyId: string;
}

export class LinkActionInput {
    gtmEventName?: Nullable<string>;
    url: string;
    target?: Nullable<string>;
}

export class EmailActionInput {
    gtmEventName?: Nullable<string>;
    email: string;
}

export class ButtonBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
    label: string;
    variant?: Nullable<ButtonVariant>;
    color?: Nullable<ButtonColor>;
    size?: Nullable<ButtonSize>;
}

export class ButtonBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    label?: Nullable<string>;
    variant?: Nullable<ButtonVariant>;
    color?: Nullable<ButtonColor>;
    size?: Nullable<ButtonSize>;
    startIconId?: Nullable<string>;
    endIconId?: Nullable<string>;
}

export class CardBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
    backgroundColor?: Nullable<string>;
    fullscreen?: Nullable<boolean>;
    themeMode?: Nullable<ThemeMode>;
    themeName?: Nullable<ThemeName>;
}

export class CardBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    backgroundColor?: Nullable<string>;
    fullscreen?: Nullable<boolean>;
    themeMode?: Nullable<ThemeMode>;
    themeName?: Nullable<ThemeName>;
}

export class IconBlockCreateInput {
    id?: Nullable<string>;
    parentBlockId: string;
    journeyId: string;
    name?: Nullable<IconName>;
    color?: Nullable<IconColor>;
    size?: Nullable<IconSize>;
}

export class IconBlockUpdateInput {
    name?: Nullable<IconName>;
    color?: Nullable<IconColor>;
    size?: Nullable<IconSize>;
}

export class ImageBlockCreateInput {
    id?: Nullable<string>;
    parentBlockId?: Nullable<string>;
    journeyId: string;
    src?: Nullable<string>;
    alt: string;
    blurhash?: Nullable<string>;
    width?: Nullable<number>;
    height?: Nullable<number>;
    isCover?: Nullable<boolean>;
}

export class ImageBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    src?: Nullable<string>;
    alt?: Nullable<string>;
    blurhash?: Nullable<string>;
    width?: Nullable<number>;
    height?: Nullable<number>;
}

export class RadioOptionBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
    label: string;
}

export class RadioOptionBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    label?: Nullable<string>;
}

export class RadioQuestionBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
}

export class SignUpBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
    submitLabel: string;
}

export class SignUpBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    submitIconId?: Nullable<string>;
    submitLabel?: Nullable<string>;
}

export class StepBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    nextBlockId?: Nullable<string>;
    locked?: Nullable<boolean>;
}

export class StepBlockUpdateInput {
    nextBlockId?: Nullable<string>;
    locked?: Nullable<boolean>;
}

export class TextResponseBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
    label: string;
    submitLabel: string;
}

export class TextResponseBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    label?: Nullable<string>;
    hint?: Nullable<string>;
    minRows?: Nullable<number>;
    submitIconId?: Nullable<string>;
    submitLabel?: Nullable<string>;
}

export class TypographyBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
    content: string;
    variant?: Nullable<TypographyVariant>;
    color?: Nullable<TypographyColor>;
    align?: Nullable<TypographyAlign>;
}

export class TypographyBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    content?: Nullable<string>;
    variant?: Nullable<TypographyVariant>;
    color?: Nullable<TypographyColor>;
    align?: Nullable<TypographyAlign>;
}

export class VideoBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
    startAt?: Nullable<number>;
    endAt?: Nullable<number>;
    duration?: Nullable<number>;
    description?: Nullable<string>;
    muted?: Nullable<boolean>;
    autoplay?: Nullable<boolean>;
    videoId?: Nullable<string>;
    videoVariantLanguageId?: Nullable<string>;
    source?: Nullable<VideoBlockSource>;
    posterBlockId?: Nullable<string>;
    fullsize?: Nullable<boolean>;
    isCover?: Nullable<boolean>;
    objectFit?: Nullable<VideoBlockObjectFit>;
}

export class VideoBlockUpdateInput {
    startAt?: Nullable<number>;
    endAt?: Nullable<number>;
    muted?: Nullable<boolean>;
    autoplay?: Nullable<boolean>;
    duration?: Nullable<number>;
    videoId?: Nullable<string>;
    videoVariantLanguageId?: Nullable<string>;
    source?: Nullable<VideoBlockSource>;
    posterBlockId?: Nullable<string>;
    fullsize?: Nullable<boolean>;
    objectFit?: Nullable<VideoBlockObjectFit>;
}

export class ChatButtonCreateInput {
    link?: Nullable<string>;
    platform?: Nullable<ChatPlatform>;
}

export class ChatButtonUpdateInput {
    link?: Nullable<string>;
    platform?: Nullable<ChatPlatform>;
}

export class ButtonClickEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    stepId?: Nullable<string>;
    label?: Nullable<string>;
    value?: Nullable<string>;
    action?: Nullable<ButtonAction>;
    actionValue?: Nullable<string>;
}

export class ChatOpenEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    stepId?: Nullable<string>;
    value?: Nullable<MessagePlatform>;
}

export class JourneyViewEventCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    label?: Nullable<string>;
    value?: Nullable<string>;
}

export class RadioQuestionSubmissionEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    radioOptionBlockId: string;
    stepId?: Nullable<string>;
    label?: Nullable<string>;
    value?: Nullable<string>;
}

export class SignUpSubmissionEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    stepId?: Nullable<string>;
    name: string;
    email: string;
}

export class StepViewEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    value?: Nullable<string>;
}

export class StepNextEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    nextStepId: string;
    label?: Nullable<string>;
    value?: Nullable<string>;
}

export class TextResponseSubmissionEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    stepId?: Nullable<string>;
    label?: Nullable<string>;
    value: string;
}

export class VideoStartEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    stepId?: Nullable<string>;
    position?: Nullable<number>;
    label?: Nullable<string>;
    value?: Nullable<VideoBlockSource>;
}

export class VideoPlayEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    stepId?: Nullable<string>;
    position?: Nullable<number>;
    label?: Nullable<string>;
    value?: Nullable<VideoBlockSource>;
}

export class VideoPauseEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    stepId?: Nullable<string>;
    position?: Nullable<number>;
    label?: Nullable<string>;
    value?: Nullable<VideoBlockSource>;
}

export class VideoCompleteEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    stepId?: Nullable<string>;
    position?: Nullable<number>;
    label?: Nullable<string>;
    value?: Nullable<VideoBlockSource>;
}

export class VideoExpandEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    stepId?: Nullable<string>;
    position?: Nullable<number>;
    label?: Nullable<string>;
    value?: Nullable<VideoBlockSource>;
}

export class VideoCollapseEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    stepId?: Nullable<string>;
    position?: Nullable<number>;
    label?: Nullable<string>;
    value?: Nullable<VideoBlockSource>;
}

export class VideoProgressEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    stepId?: Nullable<string>;
    position?: Nullable<number>;
    progress: number;
    label?: Nullable<string>;
    value?: Nullable<VideoBlockSource>;
}

export class HostUpdateInput {
    title?: Nullable<string>;
    location?: Nullable<string>;
    src1?: Nullable<string>;
    src2?: Nullable<string>;
}

export class HostCreateInput {
    title: string;
    location?: Nullable<string>;
    src1?: Nullable<string>;
    src2?: Nullable<string>;
}

export class JourneysFilter {
    featured?: Nullable<boolean>;
    template?: Nullable<boolean>;
    ids?: Nullable<string[]>;
    tagIds?: Nullable<string[]>;
}

export class JourneyCreateInput {
    id?: Nullable<string>;
    title: string;
    languageId: string;
    themeMode?: Nullable<ThemeMode>;
    themeName?: Nullable<ThemeName>;
    description?: Nullable<string>;
    slug?: Nullable<string>;
}

export class JourneyUpdateInput {
    title?: Nullable<string>;
    languageId?: Nullable<string>;
    themeMode?: Nullable<ThemeMode>;
    themeName?: Nullable<ThemeName>;
    description?: Nullable<string>;
    primaryImageBlockId?: Nullable<string>;
    slug?: Nullable<string>;
    seoTitle?: Nullable<string>;
    seoDescription?: Nullable<string>;
    hostId?: Nullable<string>;
    tagIds?: Nullable<string[]>;
}

export class JourneyTemplateInput {
    template?: Nullable<boolean>;
}

export class JourneyProfileUpdateInput {
    lastActiveTeamId?: Nullable<string>;
}

export class JourneyVisitorFilter {
    journeyId: string;
    hasChatStarted?: Nullable<boolean>;
    hasPollAnswers?: Nullable<boolean>;
    hasTextResponse?: Nullable<boolean>;
    hasIcon?: Nullable<boolean>;
    hideInactive?: Nullable<boolean>;
    countryCode?: Nullable<string>;
}

export class TeamCreateInput {
    title: string;
    publicTitle?: Nullable<string>;
}

export class TeamUpdateInput {
    title: string;
    publicTitle?: Nullable<string>;
}

export class UserInviteCreateInput {
    email: string;
}

export class UserTeamUpdateInput {
    role: UserTeamRole;
}

export class UserTeamFilterInput {
    role?: Nullable<UserTeamRole[]>;
}

export class UserTeamInviteCreateInput {
    email: string;
}

export class VisitorUpdateInput {
    email?: Nullable<string>;
    messagePlatformId?: Nullable<string>;
    messagePlatform?: Nullable<MessagePlatform>;
    name?: Nullable<string>;
    notes?: Nullable<string>;
    status?: Nullable<VisitorStatus>;
    countryCode?: Nullable<string>;
    referrer?: Nullable<string>;
}

export interface Action {
    parentBlockId: string;
    gtmEventName?: Nullable<string>;
}

export interface Block {
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
}

export interface Event {
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
}

export class NavigateAction implements Action {
    __typename?: 'NavigateAction';
    parentBlockId: string;
    gtmEventName?: Nullable<string>;
}

export class NavigateToBlockAction implements Action {
    __typename?: 'NavigateToBlockAction';
    parentBlockId: string;
    gtmEventName?: Nullable<string>;
    blockId: string;
}

export class NavigateToJourneyAction implements Action {
    __typename?: 'NavigateToJourneyAction';
    parentBlockId: string;
    gtmEventName?: Nullable<string>;
    journeyId: string;
    journey?: Nullable<Journey>;
}

export class LinkAction implements Action {
    __typename?: 'LinkAction';
    parentBlockId: string;
    gtmEventName?: Nullable<string>;
    url: string;
    target?: Nullable<string>;
}

export class EmailAction implements Action {
    __typename?: 'EmailAction';
    parentBlockId: string;
    gtmEventName?: Nullable<string>;
    email: string;
}

export class Journey {
    __typename?: 'Journey';
    blocks?: Nullable<Block[]>;
    primaryImageBlock?: Nullable<ImageBlock>;
    chatButtons: ChatButton[];
    id: string;
    title: string;
    language: Language;
    themeMode: ThemeMode;
    themeName: ThemeName;
    description?: Nullable<string>;
    slug: string;
    archivedAt?: Nullable<DateTime>;
    deletedAt?: Nullable<DateTime>;
    publishedAt?: Nullable<DateTime>;
    trashedAt?: Nullable<DateTime>;
    featuredAt?: Nullable<DateTime>;
    createdAt: DateTime;
    status: JourneyStatus;
    seoTitle?: Nullable<string>;
    seoDescription?: Nullable<string>;
    template?: Nullable<boolean>;
    host?: Nullable<Host>;
    team?: Nullable<Team>;
    tags: Tag[];
    userJourneys?: Nullable<UserJourney[]>;
}

export class ButtonBlock implements Block {
    __typename?: 'ButtonBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    label: string;
    variant?: Nullable<ButtonVariant>;
    color?: Nullable<ButtonColor>;
    size?: Nullable<ButtonSize>;
    startIconId?: Nullable<string>;
    endIconId?: Nullable<string>;
    action?: Nullable<Action>;
}

export class CardBlock implements Block {
    __typename?: 'CardBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    backgroundColor?: Nullable<string>;
    coverBlockId?: Nullable<string>;
    fullscreen: boolean;
    themeMode?: Nullable<ThemeMode>;
    themeName?: Nullable<ThemeName>;
}

export class GridContainerBlock implements Block {
    __typename?: 'GridContainerBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    spacing: number;
    direction: GridDirection;
    justifyContent: GridJustifyContent;
    alignItems: GridAlignItems;
}

export class GridItemBlock implements Block {
    __typename?: 'GridItemBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    xl: number;
    lg: number;
    sm: number;
}

export class IconBlock implements Block {
    __typename?: 'IconBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    name?: Nullable<IconName>;
    color?: Nullable<IconColor>;
    size?: Nullable<IconSize>;
}

export class ImageBlock implements Block {
    __typename?: 'ImageBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    src?: Nullable<string>;
    width: number;
    height: number;
    alt: string;
    blurhash: string;
}

export class RadioOptionBlock implements Block {
    __typename?: 'RadioOptionBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    label: string;
    action?: Nullable<Action>;
}

export class RadioQuestionBlock implements Block {
    __typename?: 'RadioQuestionBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
}

export class SignUpBlock implements Block {
    __typename?: 'SignUpBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    action?: Nullable<Action>;
    submitIconId?: Nullable<string>;
    submitLabel?: Nullable<string>;
}

export class StepBlock implements Block {
    __typename?: 'StepBlock';
    id: string;
    journeyId: string;
    nextBlockId?: Nullable<string>;
    locked: boolean;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
}

export class TextResponseBlock implements Block {
    __typename?: 'TextResponseBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    label: string;
    hint?: Nullable<string>;
    minRows?: Nullable<number>;
    action?: Nullable<Action>;
    submitIconId?: Nullable<string>;
    submitLabel?: Nullable<string>;
}

export class TypographyBlock implements Block {
    __typename?: 'TypographyBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    content: string;
    variant?: Nullable<TypographyVariant>;
    color?: Nullable<TypographyColor>;
    align?: Nullable<TypographyAlign>;
}

export class VideoBlock implements Block {
    __typename?: 'VideoBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    startAt?: Nullable<number>;
    endAt?: Nullable<number>;
    muted?: Nullable<boolean>;
    autoplay?: Nullable<boolean>;
    posterBlockId?: Nullable<string>;
    fullsize?: Nullable<boolean>;
    video?: Nullable<Video>;
    videoId?: Nullable<string>;
    videoVariantLanguageId?: Nullable<string>;
    source: VideoBlockSource;
    title?: Nullable<string>;
    description?: Nullable<string>;
    image?: Nullable<string>;
    duration?: Nullable<number>;
    action?: Nullable<Action>;
    objectFit?: Nullable<VideoBlockObjectFit>;
}

export class VideoTriggerBlock implements Block {
    __typename?: 'VideoTriggerBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    triggerStart: number;
    action: Action;
}

export class ChatButton {
    __typename?: 'ChatButton';
    id: string;
    link?: Nullable<string>;
    platform?: Nullable<ChatPlatform>;
}

export class ButtonClickEvent implements Event {
    __typename?: 'ButtonClickEvent';
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
    action?: Nullable<ButtonAction>;
    actionValue?: Nullable<string>;
}

export class ChatOpenEvent implements Event {
    __typename?: 'ChatOpenEvent';
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
    messagePlatform?: Nullable<MessagePlatform>;
}

export class JourneyViewEvent implements Event {
    __typename?: 'JourneyViewEvent';
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
    language?: Nullable<Language>;
}

export class RadioQuestionSubmissionEvent implements Event {
    __typename?: 'RadioQuestionSubmissionEvent';
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
}

export class SignUpSubmissionEvent implements Event {
    __typename?: 'SignUpSubmissionEvent';
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
    email?: Nullable<string>;
}

export class StepViewEvent implements Event {
    __typename?: 'StepViewEvent';
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
}

export class StepNextEvent implements Event {
    __typename?: 'StepNextEvent';
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
}

export class TextResponseSubmissionEvent implements Event {
    __typename?: 'TextResponseSubmissionEvent';
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
}

export class VideoStartEvent implements Event {
    __typename?: 'VideoStartEvent';
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
    position?: Nullable<number>;
    source?: Nullable<VideoBlockSource>;
}

export class VideoPlayEvent implements Event {
    __typename?: 'VideoPlayEvent';
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
    position?: Nullable<number>;
    source?: Nullable<VideoBlockSource>;
}

export class VideoPauseEvent implements Event {
    __typename?: 'VideoPauseEvent';
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
    position?: Nullable<number>;
    source?: Nullable<VideoBlockSource>;
}

export class VideoCompleteEvent implements Event {
    __typename?: 'VideoCompleteEvent';
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
    position?: Nullable<number>;
    source?: Nullable<VideoBlockSource>;
}

export class VideoExpandEvent implements Event {
    __typename?: 'VideoExpandEvent';
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
    position?: Nullable<number>;
    source?: Nullable<VideoBlockSource>;
}

export class VideoCollapseEvent implements Event {
    __typename?: 'VideoCollapseEvent';
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
    position?: Nullable<number>;
    source?: Nullable<VideoBlockSource>;
}

export class VideoProgressEvent implements Event {
    __typename?: 'VideoProgressEvent';
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
    position?: Nullable<number>;
    source?: Nullable<VideoBlockSource>;
    progress: number;
}

export class Host {
    __typename?: 'Host';
    id: string;
    teamId: string;
    title: string;
    location?: Nullable<string>;
    src1?: Nullable<string>;
    src2?: Nullable<string>;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract hosts(teamId: string): Host[] | Promise<Host[]>;

    abstract adminJourneys(status?: Nullable<JourneyStatus[]>, template?: Nullable<boolean>, teamId?: Nullable<string>): Journey[] | Promise<Journey[]>;

    abstract adminJourneysReport(reportType: JourneysReportType): Nullable<PowerBiEmbed> | Promise<Nullable<PowerBiEmbed>>;

    abstract adminJourney(id: string, idType?: Nullable<IdType>): Journey | Promise<Journey>;

    abstract journeys(where?: Nullable<JourneysFilter>): Journey[] | Promise<Journey[]>;

    abstract journey(id: string, idType?: Nullable<IdType>): Journey | Promise<Journey>;

    abstract getJourneyProfile(): Nullable<JourneyProfile> | Promise<Nullable<JourneyProfile>>;

    abstract journeyVisitorsConnection(filter: JourneyVisitorFilter, first?: Nullable<number>, after?: Nullable<string>, sort?: Nullable<JourneyVisitorSort>): JourneyVisitorsConnection | Promise<JourneyVisitorsConnection>;

    abstract journeyVisitorCount(filter: JourneyVisitorFilter): number | Promise<number>;

    abstract teams(): Team[] | Promise<Team[]>;

    abstract team(id: string): Team | Promise<Team>;

    abstract userInvites(journeyId: string): Nullable<UserInvite[]> | Promise<Nullable<UserInvite[]>>;

    abstract getUserRole(): Nullable<UserRole> | Promise<Nullable<UserRole>>;

    abstract userTeams(teamId: string, where?: Nullable<UserTeamFilterInput>): UserTeam[] | Promise<UserTeam[]>;

    abstract userTeam(id: string): UserTeam | Promise<UserTeam>;

    abstract userTeamInvites(teamId: string): UserTeamInvite[] | Promise<UserTeamInvite[]>;

    abstract visitorsConnection(teamId?: Nullable<string>, first?: Nullable<number>, after?: Nullable<string>): VisitorsConnection | Promise<VisitorsConnection>;

    abstract visitor(id: string): Visitor | Promise<Visitor>;
}

export class PowerBiEmbed {
    __typename?: 'PowerBiEmbed';
    reportId: string;
    reportName: string;
    embedUrl: string;
    accessToken: string;
    expiration: string;
}

export class UserJourney {
    __typename?: 'UserJourney';
    journey?: Nullable<Journey>;
    id: string;
    userId: string;
    journeyId: string;
    role: UserJourneyRole;
    user?: Nullable<User>;
    openedAt?: Nullable<DateTime>;
}

export class JourneyProfile {
    __typename?: 'JourneyProfile';
    id: string;
    userId: string;
    acceptedTermsAt?: Nullable<DateTime>;
    lastActiveTeamId?: Nullable<string>;
}

export class JourneyVisitor {
    __typename?: 'JourneyVisitor';
    visitorId: string;
    journeyId: string;
    createdAt: DateTime;
    duration?: Nullable<number>;
    lastChatStartedAt?: Nullable<DateTime>;
    lastChatPlatform?: Nullable<MessagePlatform>;
    countryCode?: Nullable<string>;
    messagePlatform?: Nullable<MessagePlatform>;
    notes?: Nullable<string>;
    lastStepViewedAt?: Nullable<DateTime>;
    lastLinkAction?: Nullable<string>;
    lastTextResponse?: Nullable<string>;
    lastRadioQuestion?: Nullable<string>;
    lastRadioOptionSubmission?: Nullable<string>;
    events: Event[];
    visitor: Visitor;
}

export class JourneyVisitorEdge {
    __typename?: 'JourneyVisitorEdge';
    cursor: string;
    node: JourneyVisitor;
}

export class JourneyVisitorsConnection {
    __typename?: 'JourneyVisitorsConnection';
    edges: JourneyVisitorEdge[];
    pageInfo: PageInfo;
}

export class Team {
    __typename?: 'Team';
    id: string;
    title: string;
    publicTitle?: Nullable<string>;
    createdAt: DateTime;
    updatedAt: DateTime;
    userTeams: UserTeam[];
}

export class UserInvite {
    __typename?: 'UserInvite';
    id: string;
    journeyId: string;
    senderId: string;
    email: string;
    acceptedAt?: Nullable<DateTime>;
    removedAt?: Nullable<DateTime>;
}

export class UserRole {
    __typename?: 'UserRole';
    id: string;
    userId: string;
    roles?: Nullable<Role[]>;
}

export class UserTeam {
    __typename?: 'UserTeam';
    id: string;
    user: User;
    role: UserTeamRole;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export class UserTeamInvite {
    __typename?: 'UserTeamInvite';
    id: string;
    teamId: string;
    email: string;
}

export class Browser {
    __typename?: 'Browser';
    name?: Nullable<string>;
    version?: Nullable<string>;
}

export class Device {
    __typename?: 'Device';
    model?: Nullable<string>;
    type?: Nullable<DeviceType>;
    vendor?: Nullable<string>;
}

export class OperatingSystem {
    __typename?: 'OperatingSystem';
    name?: Nullable<string>;
    version?: Nullable<string>;
}

export class UserAgent {
    __typename?: 'UserAgent';
    browser: Browser;
    device: Device;
    os: OperatingSystem;
}

export class Visitor {
    __typename?: 'Visitor';
    id: string;
    createdAt: DateTime;
    duration?: Nullable<number>;
    lastChatStartedAt?: Nullable<DateTime>;
    lastChatPlatform?: Nullable<MessagePlatform>;
    userAgent?: Nullable<UserAgent>;
    countryCode?: Nullable<string>;
    name?: Nullable<string>;
    email?: Nullable<string>;
    status?: Nullable<VisitorStatus>;
    messagePlatform?: Nullable<MessagePlatform>;
    messagePlatformId?: Nullable<string>;
    notes?: Nullable<string>;
    lastStepViewedAt?: Nullable<DateTime>;
    lastLinkAction?: Nullable<string>;
    lastTextResponse?: Nullable<string>;
    lastRadioQuestion?: Nullable<string>;
    lastRadioOptionSubmission?: Nullable<string>;
    referrer?: Nullable<string>;
    events: Event[];
}

export class VisitorEdge {
    __typename?: 'VisitorEdge';
    cursor: string;
    node: Visitor;
}

export class PageInfo {
    __typename?: 'PageInfo';
    hasNextPage: boolean;
    startCursor?: Nullable<string>;
    endCursor?: Nullable<string>;
}

export class VisitorsConnection {
    __typename?: 'VisitorsConnection';
    edges: VisitorEdge[];
    pageInfo: PageInfo;
}

export class Translation {
    __typename?: 'Translation';
    value: string;
    language: Language;
    primary: boolean;
}

export abstract class IMutation {
    abstract blockDeleteAction(id: string, journeyId: string): Block | Promise<Block>;

    abstract blockUpdateNavigateAction(id: string, journeyId: string, input: NavigateActionInput): NavigateAction | Promise<NavigateAction>;

    abstract blockUpdateNavigateToBlockAction(id: string, journeyId: string, input: NavigateToBlockActionInput): NavigateToBlockAction | Promise<NavigateToBlockAction>;

    abstract blockUpdateNavigateToJourneyAction(id: string, journeyId: string, input: NavigateToJourneyActionInput): NavigateToJourneyAction | Promise<NavigateToJourneyAction>;

    abstract blockUpdateLinkAction(id: string, journeyId: string, input: LinkActionInput): LinkAction | Promise<LinkAction>;

    abstract blockUpdateEmailAction(id: string, journeyId: string, input: EmailActionInput): EmailAction | Promise<EmailAction>;

    abstract blockDelete(id: string, journeyId?: Nullable<string>, parentBlockId?: Nullable<string>): Block[] | Promise<Block[]>;

    abstract blockDuplicate(id: string, parentOrder?: Nullable<number>, journeyId?: Nullable<string>): Block[] | Promise<Block[]>;

    abstract blockOrderUpdate(id: string, parentOrder: number, journeyId?: Nullable<string>): Block[] | Promise<Block[]>;

    abstract buttonBlockCreate(input: ButtonBlockCreateInput): ButtonBlock | Promise<ButtonBlock>;

    abstract buttonBlockUpdate(id: string, input: ButtonBlockUpdateInput, journeyId?: Nullable<string>): Nullable<ButtonBlock> | Promise<Nullable<ButtonBlock>>;

    abstract cardBlockCreate(input: CardBlockCreateInput): CardBlock | Promise<CardBlock>;

    abstract cardBlockUpdate(id: string, input: CardBlockUpdateInput, journeyId?: Nullable<string>): CardBlock | Promise<CardBlock>;

    abstract iconBlockCreate(input: IconBlockCreateInput): IconBlock | Promise<IconBlock>;

    abstract iconBlockUpdate(id: string, input: IconBlockUpdateInput, journeyId?: Nullable<string>): IconBlock | Promise<IconBlock>;

    abstract imageBlockCreate(input: ImageBlockCreateInput): ImageBlock | Promise<ImageBlock>;

    abstract imageBlockUpdate(id: string, input: ImageBlockUpdateInput, journeyId?: Nullable<string>): ImageBlock | Promise<ImageBlock>;

    abstract radioOptionBlockCreate(input: RadioOptionBlockCreateInput): RadioOptionBlock | Promise<RadioOptionBlock>;

    abstract radioOptionBlockUpdate(id: string, input: RadioOptionBlockUpdateInput, journeyId?: Nullable<string>): RadioOptionBlock | Promise<RadioOptionBlock>;

    abstract radioQuestionBlockCreate(input: RadioQuestionBlockCreateInput): RadioQuestionBlock | Promise<RadioQuestionBlock>;

    abstract radioQuestionBlockUpdate(id: string, parentBlockId: string, journeyId?: Nullable<string>): RadioQuestionBlock | Promise<RadioQuestionBlock>;

    abstract signUpBlockCreate(input: SignUpBlockCreateInput): SignUpBlock | Promise<SignUpBlock>;

    abstract signUpBlockUpdate(id: string, input: SignUpBlockUpdateInput, journeyId?: Nullable<string>): Nullable<SignUpBlock> | Promise<Nullable<SignUpBlock>>;

    abstract stepBlockCreate(input: StepBlockCreateInput): StepBlock | Promise<StepBlock>;

    abstract stepBlockUpdate(id: string, input: StepBlockUpdateInput, journeyId?: Nullable<string>): StepBlock | Promise<StepBlock>;

    abstract textResponseBlockCreate(input: TextResponseBlockCreateInput): TextResponseBlock | Promise<TextResponseBlock>;

    abstract textResponseBlockUpdate(id: string, input: TextResponseBlockUpdateInput, journeyId?: Nullable<string>): Nullable<TextResponseBlock> | Promise<Nullable<TextResponseBlock>>;

    abstract typographyBlockCreate(input: TypographyBlockCreateInput): TypographyBlock | Promise<TypographyBlock>;

    abstract typographyBlockUpdate(id: string, input: TypographyBlockUpdateInput, journeyId?: Nullable<string>): TypographyBlock | Promise<TypographyBlock>;

    abstract videoBlockCreate(input: VideoBlockCreateInput): VideoBlock | Promise<VideoBlock>;

    abstract videoBlockUpdate(id: string, input: VideoBlockUpdateInput, journeyId?: Nullable<string>): VideoBlock | Promise<VideoBlock>;

    abstract chatButtonCreate(journeyId: string, input?: Nullable<ChatButtonCreateInput>): ChatButton | Promise<ChatButton>;

    abstract chatButtonUpdate(id: string, journeyId: string, input: ChatButtonUpdateInput): ChatButton | Promise<ChatButton>;

    abstract chatButtonRemove(id: string): ChatButton | Promise<ChatButton>;

    abstract buttonClickEventCreate(input: ButtonClickEventCreateInput): ButtonClickEvent | Promise<ButtonClickEvent>;

    abstract chatOpenEventCreate(input: ChatOpenEventCreateInput): ChatOpenEvent | Promise<ChatOpenEvent>;

    abstract journeyViewEventCreate(input: JourneyViewEventCreateInput): JourneyViewEvent | Promise<JourneyViewEvent>;

    abstract radioQuestionSubmissionEventCreate(input: RadioQuestionSubmissionEventCreateInput): RadioQuestionSubmissionEvent | Promise<RadioQuestionSubmissionEvent>;

    abstract signUpSubmissionEventCreate(input: SignUpSubmissionEventCreateInput): SignUpSubmissionEvent | Promise<SignUpSubmissionEvent>;

    abstract stepViewEventCreate(input: StepViewEventCreateInput): StepViewEvent | Promise<StepViewEvent>;

    abstract stepNextEventCreate(input: StepNextEventCreateInput): StepNextEvent | Promise<StepNextEvent>;

    abstract textResponseSubmissionEventCreate(input: TextResponseSubmissionEventCreateInput): TextResponseSubmissionEvent | Promise<TextResponseSubmissionEvent>;

    abstract videoStartEventCreate(input: VideoStartEventCreateInput): VideoStartEvent | Promise<VideoStartEvent>;

    abstract videoPlayEventCreate(input: VideoPlayEventCreateInput): VideoPlayEvent | Promise<VideoPlayEvent>;

    abstract videoPauseEventCreate(input: VideoPauseEventCreateInput): VideoPauseEvent | Promise<VideoPauseEvent>;

    abstract videoCompleteEventCreate(input: VideoCompleteEventCreateInput): VideoCompleteEvent | Promise<VideoCompleteEvent>;

    abstract videoExpandEventCreate(input: VideoExpandEventCreateInput): VideoExpandEvent | Promise<VideoExpandEvent>;

    abstract videoCollapseEventCreate(input: VideoCollapseEventCreateInput): VideoCollapseEvent | Promise<VideoCollapseEvent>;

    abstract videoProgressEventCreate(input: VideoProgressEventCreateInput): VideoProgressEvent | Promise<VideoProgressEvent>;

    abstract hostCreate(teamId: string, input: HostCreateInput): Host | Promise<Host>;

    abstract hostUpdate(id: string, teamId: string, input?: Nullable<HostUpdateInput>): Host | Promise<Host>;

    abstract hostDelete(id: string, teamId: string): Host | Promise<Host>;

    abstract journeyCreate(input: JourneyCreateInput, teamId: string): Journey | Promise<Journey>;

    abstract journeyDuplicate(id: string, teamId: string): Journey | Promise<Journey>;

    abstract journeyUpdate(id: string, input: JourneyUpdateInput): Journey | Promise<Journey>;

    abstract journeyPublish(id: string): Nullable<Journey> | Promise<Nullable<Journey>>;

    abstract journeyFeature(id: string, feature: boolean): Nullable<Journey> | Promise<Nullable<Journey>>;

    abstract journeysArchive(ids: string[]): Nullable<Nullable<Journey>[]> | Promise<Nullable<Nullable<Journey>[]>>;

    abstract journeysDelete(ids: string[]): Nullable<Nullable<Journey>[]> | Promise<Nullable<Nullable<Journey>[]>>;

    abstract journeysTrash(ids: string[]): Nullable<Nullable<Journey>[]> | Promise<Nullable<Nullable<Journey>[]>>;

    abstract journeysRestore(ids: string[]): Nullable<Nullable<Journey>[]> | Promise<Nullable<Nullable<Journey>[]>>;

    abstract journeyTemplate(id: string, input: JourneyTemplateInput): Journey | Promise<Journey>;

    abstract journeyProfileCreate(): JourneyProfile | Promise<JourneyProfile>;

    abstract journeyProfileUpdate(input: JourneyProfileUpdateInput): JourneyProfile | Promise<JourneyProfile>;

    abstract teamCreate(input?: Nullable<TeamCreateInput>): Team | Promise<Team>;

    abstract teamUpdate(id: string, input?: Nullable<TeamUpdateInput>): Team | Promise<Team>;

    abstract userInviteCreate(journeyId: string, input?: Nullable<UserInviteCreateInput>): Nullable<UserInvite> | Promise<Nullable<UserInvite>>;

    abstract userInviteRemove(id: string, journeyId: string): UserInvite | Promise<UserInvite>;

    abstract userInviteAcceptAll(): UserInvite[] | Promise<UserInvite[]>;

    abstract userJourneyApprove(id: string): UserJourney | Promise<UserJourney>;

    abstract userJourneyPromote(id: string): UserJourney | Promise<UserJourney>;

    abstract userJourneyRemove(id: string): UserJourney | Promise<UserJourney>;

    abstract userJourneyRemoveAll(id: string): UserJourney[] | Promise<UserJourney[]>;

    abstract userJourneyRequest(journeyId: string, idType?: Nullable<IdType>): UserJourney | Promise<UserJourney>;

    abstract userJourneyOpen(id: string): Nullable<UserJourney> | Promise<Nullable<UserJourney>>;

    abstract userTeamUpdate(id: string, input?: Nullable<UserTeamUpdateInput>): UserTeam | Promise<UserTeam>;

    abstract userTeamDelete(id: string): UserTeam | Promise<UserTeam>;

    abstract userTeamInviteCreate(teamId: string, input?: Nullable<UserTeamInviteCreateInput>): Nullable<UserTeamInvite> | Promise<Nullable<UserTeamInvite>>;

    abstract userTeamInviteRemove(id: string): UserTeamInvite | Promise<UserTeamInvite>;

    abstract userTeamInviteAcceptAll(): UserTeamInvite[] | Promise<UserTeamInvite[]>;

    abstract visitorUpdate(id: string, input: VisitorUpdateInput): Visitor | Promise<Visitor>;

    abstract visitorUpdateForCurrentUser(input: VisitorUpdateInput): Visitor | Promise<Visitor>;
}

export class Video {
    id: string;
    primaryLanguageId: string;
}

export class Language {
    id: string;
}

export class Tag {
    id: string;
}

export class User {
    id: string;
}

export type DateTime = String;
type Nullable<T> = T | null;
