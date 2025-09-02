
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
    contained = "contained",
    outlined = "outlined"
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

export enum ButtonAlignment {
    left = "left",
    center = "center",
    right = "right",
    justify = "justify"
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
    ContactSupportRounded = "ContactSupportRounded",
    Launch = "Launch",
    MailOutline = "MailOutline"
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

export enum TextResponseType {
    freeForm = "freeForm",
    name = "name",
    email = "email",
    phone = "phone"
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
    cloudflare = "cloudflare",
    mux = "mux"
}

export enum VideoBlockObjectFit {
    fill = "fill",
    fit = "fit",
    zoomed = "zoomed"
}

export enum ButtonAction {
    NavigateToBlockAction = "NavigateToBlockAction",
    LinkAction = "LinkAction",
    EmailAction = "EmailAction",
    PhoneAction = "PhoneAction"
}

export enum MessagePlatform {
    facebook = "facebook",
    telegram = "telegram",
    whatsApp = "whatsApp",
    instagram = "instagram",
    kakaoTalk = "kakaoTalk",
    viber = "viber",
    vk = "vk",
    snapchat = "snapchat",
    skype = "skype",
    line = "line",
    tikTok = "tikTok",
    custom = "custom",
    globe2 = "globe2",
    globe3 = "globe3",
    messageText1 = "messageText1",
    messageText2 = "messageText2",
    send1 = "send1",
    send2 = "send2",
    messageChat2 = "messageChat2",
    messageCircle = "messageCircle",
    messageNotifyCircle = "messageNotifyCircle",
    messageNotifySquare = "messageNotifySquare",
    messageSquare = "messageSquare",
    mail1 = "mail1",
    linkExternal = "linkExternal",
    home3 = "home3",
    home4 = "home4",
    helpCircleContained = "helpCircleContained",
    helpSquareContained = "helpSquareContained",
    shieldCheck = "shieldCheck",
    menu1 = "menu1",
    checkBroken = "checkBroken",
    checkContained = "checkContained",
    settings = "settings"
}

export enum IntegrationType {
    growthSpaces = "growthSpaces"
}

export enum JourneyMenuButtonIcon {
    menu1 = "menu1",
    equals = "equals",
    home3 = "home3",
    home4 = "home4",
    more = "more",
    ellipsis = "ellipsis",
    grid1 = "grid1",
    chevronDown = "chevronDown"
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

export class NavigateToBlockActionInput {
    gtmEventName?: Nullable<string>;
    blockId: string;
}

export class LinkActionInput {
    gtmEventName?: Nullable<string>;
    url: string;
    target?: Nullable<string>;
    customizable?: Nullable<boolean>;
    parentStepId?: Nullable<string>;
}

export class EmailActionInput {
    gtmEventName?: Nullable<string>;
    email: string;
    customizable?: Nullable<boolean>;
    parentStepId?: Nullable<string>;
}

export class BlockUpdateActionInput {
    gtmEventName?: Nullable<string>;
    email?: Nullable<string>;
    url?: Nullable<string>;
    target?: Nullable<string>;
    blockId?: Nullable<string>;
    phone?: Nullable<string>;
}

export class PhoneActionInput {
    gtmEventName?: Nullable<string>;
    phone: string;
}

export class BlocksFilter {
    journeyIds?: Nullable<string[]>;
    typenames?: Nullable<string[]>;
}

export class BlockDuplicateIdMap {
    oldId: string;
    newId: string;
}

export class ButtonBlockSettingsInput {
    alignment?: Nullable<ButtonAlignment>;
    color?: Nullable<string>;
}

export class ButtonBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
    label: string;
    variant?: Nullable<ButtonVariant>;
    color?: Nullable<ButtonColor>;
    size?: Nullable<ButtonSize>;
    submitEnabled?: Nullable<boolean>;
    settings?: Nullable<ButtonBlockSettingsInput>;
}

export class ButtonBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    label?: Nullable<string>;
    variant?: Nullable<ButtonVariant>;
    color?: Nullable<ButtonColor>;
    size?: Nullable<ButtonSize>;
    startIconId?: Nullable<string>;
    endIconId?: Nullable<string>;
    submitEnabled?: Nullable<boolean>;
    settings?: Nullable<ButtonBlockSettingsInput>;
}

export class CardBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
    backgroundColor?: Nullable<string>;
    backdropBlur?: Nullable<number>;
    fullscreen?: Nullable<boolean>;
    themeMode?: Nullable<ThemeMode>;
    themeName?: Nullable<ThemeName>;
}

export class CardBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    coverBlockId?: Nullable<string>;
    backgroundColor?: Nullable<string>;
    backdropBlur?: Nullable<number>;
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
    scale?: Nullable<number>;
    focalTop?: Nullable<number>;
    focalLeft?: Nullable<number>;
}

export class ImageBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    src?: Nullable<string>;
    alt?: Nullable<string>;
    blurhash?: Nullable<string>;
    width?: Nullable<number>;
    height?: Nullable<number>;
    scale?: Nullable<number>;
    focalTop?: Nullable<number>;
    focalLeft?: Nullable<number>;
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
    pollOptionImageBlockId?: Nullable<string>;
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

export class SpacerBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
    spacing?: Nullable<number>;
}

export class SpacerBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    spacing?: Nullable<number>;
}

export class StepBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    nextBlockId?: Nullable<string>;
    locked?: Nullable<boolean>;
    x?: Nullable<number>;
    y?: Nullable<number>;
}

export class StepBlockUpdateInput {
    nextBlockId?: Nullable<string>;
    locked?: Nullable<boolean>;
    x?: Nullable<number>;
    y?: Nullable<number>;
    slug?: Nullable<string>;
}

export class StepBlockPositionUpdateInput {
    id: string;
    x?: Nullable<number>;
    y?: Nullable<number>;
}

export class TextResponseBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
    label: string;
}

export class TextResponseBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    label?: Nullable<string>;
    placeholder?: Nullable<string>;
    required?: Nullable<boolean>;
    hint?: Nullable<string>;
    minRows?: Nullable<number>;
    routeId?: Nullable<string>;
    type?: Nullable<TextResponseType>;
    integrationId?: Nullable<string>;
}

export class TypographyBlockSettingsInput {
    color?: Nullable<string>;
}

export class TypographyBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
    content: string;
    variant?: Nullable<TypographyVariant>;
    color?: Nullable<TypographyColor>;
    align?: Nullable<TypographyAlign>;
    settings?: Nullable<TypographyBlockSettingsInput>;
}

export class TypographyBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    content?: Nullable<string>;
    variant?: Nullable<TypographyVariant>;
    color?: Nullable<TypographyColor>;
    align?: Nullable<TypographyAlign>;
    settings?: Nullable<TypographyBlockSettingsInput>;
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
    platform?: Nullable<MessagePlatform>;
}

export class ChatButtonUpdateInput {
    link?: Nullable<string>;
    platform?: Nullable<MessagePlatform>;
}

export class CustomDomainCreateInput {
    id?: Nullable<string>;
    teamId: string;
    name: string;
    journeyCollectionId?: Nullable<string>;
    routeAllTeamJourneys?: Nullable<boolean>;
}

export class CustomDomainUpdateInput {
    journeyCollectionId?: Nullable<string>;
    routeAllTeamJourneys?: Nullable<boolean>;
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

export class StepPreviousEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    previousStepId: string;
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

export class IntegrationGrowthSpacesCreateInput {
    accessId: string;
    accessSecret: string;
    teamId: string;
}

export class IntegrationGrowthSpacesUpdateInput {
    accessId: string;
    accessSecret: string;
}

export class JourneysFilter {
    featured?: Nullable<boolean>;
    template?: Nullable<boolean>;
    ids?: Nullable<string[]>;
    tagIds?: Nullable<string[]>;
    languageIds?: Nullable<string[]>;
    limit?: Nullable<number>;
    orderByRecent?: Nullable<boolean>;
}

export class JourneysQueryOptions {
    hostname?: Nullable<string>;
    embedded?: Nullable<boolean>;
    journeyCollection?: Nullable<boolean>;
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
    creatorDescription?: Nullable<string>;
    creatorImageBlockId?: Nullable<string>;
    primaryImageBlockId?: Nullable<string>;
    slug?: Nullable<string>;
    seoTitle?: Nullable<string>;
    seoDescription?: Nullable<string>;
    hostId?: Nullable<string>;
    strategySlug?: Nullable<string>;
    tagIds?: Nullable<string[]>;
    website?: Nullable<boolean>;
    showShareButton?: Nullable<boolean>;
    showLikeButton?: Nullable<boolean>;
    showDislikeButton?: Nullable<boolean>;
    displayTitle?: Nullable<string>;
    showHosts?: Nullable<boolean>;
    showChatButtons?: Nullable<boolean>;
    showReactionButtons?: Nullable<boolean>;
    showLogo?: Nullable<boolean>;
    showMenu?: Nullable<boolean>;
    showDisplayTitle?: Nullable<boolean>;
    menuButtonIcon?: Nullable<JourneyMenuButtonIcon>;
    menuStepBlockId?: Nullable<string>;
    logoImageBlockId?: Nullable<string>;
    socialNodeX?: Nullable<number>;
    socialNodeY?: Nullable<number>;
}

export class JourneyTemplateInput {
    template?: Nullable<boolean>;
}

export class JourneyCollectionCreateInput {
    id?: Nullable<string>;
    teamId: string;
    title?: Nullable<string>;
    journeyIds?: Nullable<string[]>;
}

export class JourneyCollectionUpdateInput {
    title?: Nullable<string>;
    journeyIds?: Nullable<string[]>;
}

export class JourneyCustomizationFieldInput {
    id: string;
    key: string;
    value?: Nullable<string>;
}

export class JourneyEventsFilter {
    typenames?: Nullable<string[]>;
    periodRangeStart?: Nullable<DateTime>;
    periodRangeEnd?: Nullable<DateTime>;
}

export class JourneyNotificationUpdateInput {
    journeyId: string;
    visitorInteractionEmail: boolean;
}

export class JourneyProfileUpdateInput {
    lastActiveTeamId?: Nullable<string>;
    journeyFlowBackButtonClicked?: Nullable<boolean>;
    plausibleJourneyFlowViewed?: Nullable<boolean>;
    plausibleDashboardViewed?: Nullable<boolean>;
}

export class JourneyThemeCreateInput {
    journeyId: string;
    headerFont?: Nullable<string>;
    bodyFont?: Nullable<string>;
    labelFont?: Nullable<string>;
}

export class JourneyThemeUpdateInput {
    headerFont?: Nullable<string>;
    bodyFont?: Nullable<string>;
    labelFont?: Nullable<string>;
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

export class JourneysEmailPreferenceUpdateInput {
    email: string;
    preference: string;
    value: boolean;
}

export class PlausibleStatsAggregateFilter {
    period?: Nullable<string>;
    date?: Nullable<string>;
    filters?: Nullable<string>;
    interval?: Nullable<string>;
}

export class PlausibleStatsBreakdownFilter {
    property: string;
    period?: Nullable<string>;
    date?: Nullable<string>;
    limit?: Nullable<number>;
    page?: Nullable<number>;
    filters?: Nullable<string>;
}

export class PlausibleStatsTimeseriesFilter {
    period?: Nullable<string>;
    date?: Nullable<string>;
    filters?: Nullable<string>;
    interval?: Nullable<string>;
}

export class QrCodesFilter {
    journeyId?: Nullable<string>;
    teamId?: Nullable<string>;
}

export class QrCodeCreateInput {
    teamId: string;
    journeyId: string;
}

export class QrCodeUpdateInput {
    to?: Nullable<string>;
    color?: Nullable<string>;
    backgroundColor?: Nullable<string>;
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
    phone?: Nullable<string>;
}

export interface Action {
    parentBlockId: string;
    parentBlock: Block;
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

export interface Integration {
    id: string;
    team: Team;
    type: IntegrationType;
}

export class NavigateToBlockAction implements Action {
    __typename?: 'NavigateToBlockAction';
    parentBlockId: string;
    parentBlock: Block;
    gtmEventName?: Nullable<string>;
    blockId: string;
}

export class LinkAction implements Action {
    __typename?: 'LinkAction';
    parentBlockId: string;
    parentBlock: Block;
    gtmEventName?: Nullable<string>;
    url: string;
    target?: Nullable<string>;
    customizable?: Nullable<boolean>;
    parentStepId?: Nullable<string>;
}

export class EmailAction implements Action {
    __typename?: 'EmailAction';
    parentBlockId: string;
    parentBlock: Block;
    gtmEventName?: Nullable<string>;
    email: string;
    customizable?: Nullable<boolean>;
    parentStepId?: Nullable<string>;
}

export class PhoneAction implements Action {
    __typename?: 'PhoneAction';
    parentBlockId: string;
    parentBlock: Block;
    gtmEventName?: Nullable<string>;
    phone: string;
}

export abstract class IMutation {
    __typename?: 'IMutation';

    abstract blockDeleteAction(id: string, journeyId?: Nullable<string>): Block | Promise<Block>;

    abstract blockUpdateNavigateToBlockAction(id: string, input: NavigateToBlockActionInput, journeyId?: Nullable<string>): NavigateToBlockAction | Promise<NavigateToBlockAction>;

    abstract blockUpdateLinkAction(id: string, input: LinkActionInput, journeyId?: Nullable<string>): LinkAction | Promise<LinkAction>;

    abstract blockUpdateEmailAction(id: string, input: EmailActionInput, journeyId?: Nullable<string>): EmailAction | Promise<EmailAction>;

    abstract blockUpdatePhoneAction(id: string, input: PhoneActionInput, journeyId?: Nullable<string>): PhoneAction | Promise<PhoneAction>;

    abstract blockUpdateAction(id: string, input?: Nullable<BlockUpdateActionInput>): Action | Promise<Action>;

    abstract blockDelete(id: string, journeyId?: Nullable<string>, parentBlockId?: Nullable<string>): Block[] | Promise<Block[]>;

    abstract blockDuplicate(id: string, parentOrder?: Nullable<number>, idMap?: Nullable<BlockDuplicateIdMap[]>, journeyId?: Nullable<string>, x?: Nullable<number>, y?: Nullable<number>): Block[] | Promise<Block[]>;

    abstract blockOrderUpdate(id: string, parentOrder: number, journeyId?: Nullable<string>): Block[] | Promise<Block[]>;

    abstract blockRestore(id: string): Block[] | Promise<Block[]>;

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

    abstract radioQuestionBlockUpdate(id: string, parentBlockId: string, gridView?: Nullable<boolean>): RadioQuestionBlock | Promise<RadioQuestionBlock>;

    abstract signUpBlockCreate(input: SignUpBlockCreateInput): SignUpBlock | Promise<SignUpBlock>;

    abstract signUpBlockUpdate(id: string, input: SignUpBlockUpdateInput, journeyId?: Nullable<string>): Nullable<SignUpBlock> | Promise<Nullable<SignUpBlock>>;

    abstract spacerBlockCreate(input: SpacerBlockCreateInput): SpacerBlock | Promise<SpacerBlock>;

    abstract spacerBlockUpdate(id: string, input: SpacerBlockUpdateInput): SpacerBlock | Promise<SpacerBlock>;

    abstract stepBlockCreate(input: StepBlockCreateInput): StepBlock | Promise<StepBlock>;

    abstract stepBlockUpdate(id: string, input: StepBlockUpdateInput, journeyId?: Nullable<string>): StepBlock | Promise<StepBlock>;

    abstract stepBlockPositionUpdate(input: StepBlockPositionUpdateInput[]): StepBlock[] | Promise<StepBlock[]>;

    abstract textResponseBlockCreate(input: TextResponseBlockCreateInput): TextResponseBlock | Promise<TextResponseBlock>;

    abstract textResponseBlockUpdate(id: string, input: TextResponseBlockUpdateInput, journeyId?: Nullable<string>): Nullable<TextResponseBlock> | Promise<Nullable<TextResponseBlock>>;

    abstract typographyBlockCreate(input: TypographyBlockCreateInput): TypographyBlock | Promise<TypographyBlock>;

    abstract typographyBlockUpdate(id: string, input: TypographyBlockUpdateInput, journeyId?: Nullable<string>): TypographyBlock | Promise<TypographyBlock>;

    abstract videoBlockCreate(input: VideoBlockCreateInput): VideoBlock | Promise<VideoBlock>;

    abstract videoBlockUpdate(id: string, input: VideoBlockUpdateInput, journeyId?: Nullable<string>): VideoBlock | Promise<VideoBlock>;

    abstract chatButtonCreate(journeyId: string, input?: Nullable<ChatButtonCreateInput>): ChatButton | Promise<ChatButton>;

    abstract chatButtonUpdate(id: string, journeyId: string, input: ChatButtonUpdateInput): ChatButton | Promise<ChatButton>;

    abstract chatButtonRemove(id: string): ChatButton | Promise<ChatButton>;

    abstract customDomainCreate(input: CustomDomainCreateInput): CustomDomain | Promise<CustomDomain>;

    abstract customDomainUpdate(id: string, input: CustomDomainUpdateInput): CustomDomain | Promise<CustomDomain>;

    abstract customDomainDelete(id: string): CustomDomain | Promise<CustomDomain>;

    abstract customDomainCheck(id: string): CustomDomainCheck | Promise<CustomDomainCheck>;

    abstract buttonClickEventCreate(input: ButtonClickEventCreateInput): ButtonClickEvent | Promise<ButtonClickEvent>;

    abstract chatOpenEventCreate(input: ChatOpenEventCreateInput): ChatOpenEvent | Promise<ChatOpenEvent>;

    abstract journeyViewEventCreate(input: JourneyViewEventCreateInput): Nullable<JourneyViewEvent> | Promise<Nullable<JourneyViewEvent>>;

    abstract radioQuestionSubmissionEventCreate(input: RadioQuestionSubmissionEventCreateInput): RadioQuestionSubmissionEvent | Promise<RadioQuestionSubmissionEvent>;

    abstract signUpSubmissionEventCreate(input: SignUpSubmissionEventCreateInput): SignUpSubmissionEvent | Promise<SignUpSubmissionEvent>;

    abstract stepViewEventCreate(input: StepViewEventCreateInput): StepViewEvent | Promise<StepViewEvent>;

    abstract stepNextEventCreate(input: StepNextEventCreateInput): StepNextEvent | Promise<StepNextEvent>;

    abstract stepPreviousEventCreate(input: StepPreviousEventCreateInput): StepPreviousEvent | Promise<StepPreviousEvent>;

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

    abstract integrationGrowthSpacesCreate(input: IntegrationGrowthSpacesCreateInput): IntegrationGrowthSpaces | Promise<IntegrationGrowthSpaces>;

    abstract integrationGrowthSpacesUpdate(id: string, input: IntegrationGrowthSpacesUpdateInput): IntegrationGrowthSpaces | Promise<IntegrationGrowthSpaces>;

    abstract integrationDelete(id: string): Integration | Promise<Integration>;

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

    abstract journeyCollectionCreate(input: JourneyCollectionCreateInput): JourneyCollection | Promise<JourneyCollection>;

    abstract journeyCollectionUpdate(id: string, input: JourneyCollectionUpdateInput): JourneyCollection | Promise<JourneyCollection>;

    abstract journeyCollectionDelete(id: string): JourneyCollection | Promise<JourneyCollection>;

    abstract journeyCustomizationFieldPublisherUpdate(journeyId: string, string: string): JourneyCustomizationField[] | Promise<JourneyCustomizationField[]>;

    abstract journeyCustomizationFieldUserUpdate(journeyId: string, input: JourneyCustomizationFieldInput[]): JourneyCustomizationField[] | Promise<JourneyCustomizationField[]>;

    abstract journeyNotificationUpdate(input: JourneyNotificationUpdateInput): JourneyNotification | Promise<JourneyNotification>;

    abstract journeyProfileCreate(): JourneyProfile | Promise<JourneyProfile>;

    abstract journeyProfileUpdate(input: JourneyProfileUpdateInput): JourneyProfile | Promise<JourneyProfile>;

    abstract journeyThemeCreate(input: JourneyThemeCreateInput): JourneyTheme | Promise<JourneyTheme>;

    abstract journeyThemeUpdate(id: string, input: JourneyThemeUpdateInput): JourneyTheme | Promise<JourneyTheme>;

    abstract journeyThemeDelete(id: string): JourneyTheme | Promise<JourneyTheme>;

    abstract updateJourneysEmailPreference(input: JourneysEmailPreferenceUpdateInput): Nullable<JourneysEmailPreference> | Promise<Nullable<JourneysEmailPreference>>;

    abstract qrCodeCreate(input: QrCodeCreateInput): QrCode | Promise<QrCode>;

    abstract qrCodeUpdate(id: string, input: QrCodeUpdateInput): QrCode | Promise<QrCode>;

    abstract qrCodeDelete(id: string): QrCode | Promise<QrCode>;

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

export class Journey {
    __typename?: 'Journey';
    blocks?: Nullable<Block[]>;
    primaryImageBlock?: Nullable<ImageBlock>;
    creatorImageBlock?: Nullable<ImageBlock>;
    logoImageBlock?: Nullable<ImageBlock>;
    menuStepBlock?: Nullable<StepBlock>;
    chatButtons: ChatButton[];
    id: string;
    title: string;
    language: Language;
    languageId: string;
    themeMode: ThemeMode;
    themeName: ThemeName;
    description?: Nullable<string>;
    creatorDescription?: Nullable<string>;
    slug: string;
    archivedAt?: Nullable<DateTime>;
    deletedAt?: Nullable<DateTime>;
    publishedAt?: Nullable<DateTime>;
    trashedAt?: Nullable<DateTime>;
    featuredAt?: Nullable<DateTime>;
    updatedAt: DateTime;
    createdAt: DateTime;
    status: JourneyStatus;
    seoTitle?: Nullable<string>;
    seoDescription?: Nullable<string>;
    template?: Nullable<boolean>;
    host?: Nullable<Host>;
    team?: Nullable<Team>;
    strategySlug?: Nullable<string>;
    tags: Tag[];
    journeyCollections: JourneyCollection[];
    plausibleToken?: Nullable<string>;
    website?: Nullable<boolean>;
    showShareButton?: Nullable<boolean>;
    showLikeButton?: Nullable<boolean>;
    showDislikeButton?: Nullable<boolean>;
    displayTitle?: Nullable<string>;
    showHosts?: Nullable<boolean>;
    showChatButtons?: Nullable<boolean>;
    showReactionButtons?: Nullable<boolean>;
    showLogo?: Nullable<boolean>;
    showMenu?: Nullable<boolean>;
    showDisplayTitle?: Nullable<boolean>;
    menuButtonIcon?: Nullable<JourneyMenuButtonIcon>;
    socialNodeX?: Nullable<number>;
    socialNodeY?: Nullable<number>;
    fromTemplateId?: Nullable<string>;
    journeyCustomizationDescription?: Nullable<string>;
    journeyCustomizationFields: JourneyCustomizationField[];
    journeyTheme?: Nullable<JourneyTheme>;
    userJourneys?: Nullable<UserJourney[]>;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract blocks(where?: Nullable<BlocksFilter>): Block[] | Promise<Block[]>;

    abstract block(id: string): Block | Promise<Block>;

    abstract customDomain(id: string): CustomDomain | Promise<CustomDomain>;

    abstract customDomains(teamId: string): CustomDomain[] | Promise<CustomDomain[]>;

    abstract hosts(teamId: string): Host[] | Promise<Host[]>;

    abstract integrations(teamId: string): Integration[] | Promise<Integration[]>;

    abstract adminJourneys(status?: Nullable<JourneyStatus[]>, template?: Nullable<boolean>, teamId?: Nullable<string>, useLastActiveTeamId?: Nullable<boolean>): Journey[] | Promise<Journey[]>;

    abstract adminJourneysReport(reportType: JourneysReportType): Nullable<PowerBiEmbed> | Promise<Nullable<PowerBiEmbed>>;

    abstract adminJourney(id: string, idType?: Nullable<IdType>): Journey | Promise<Journey>;

    abstract journeys(where?: Nullable<JourneysFilter>, options?: Nullable<JourneysQueryOptions>): Journey[] | Promise<Journey[]>;

    abstract journey(id: string, idType?: Nullable<IdType>, options?: Nullable<JourneysQueryOptions>): Journey | Promise<Journey>;

    abstract journeyCollection(id: string): JourneyCollection | Promise<JourneyCollection>;

    abstract journeyCollections(teamId: string): Nullable<JourneyCollection>[] | Promise<Nullable<JourneyCollection>[]>;

    abstract journeyEventsConnection(journeyId: string, filter?: Nullable<JourneyEventsFilter>, first?: Nullable<number>, after?: Nullable<string>): JourneyEventsConnection | Promise<JourneyEventsConnection>;

    abstract journeyEventsCount(journeyId: string, filter?: Nullable<JourneyEventsFilter>): number | Promise<number>;

    abstract getJourneyProfile(): Nullable<JourneyProfile> | Promise<Nullable<JourneyProfile>>;

    abstract journeyTheme(journeyId: string): Nullable<JourneyTheme> | Promise<Nullable<JourneyTheme>>;

    abstract journeyVisitorsConnection(filter: JourneyVisitorFilter, first?: Nullable<number>, after?: Nullable<string>, sort?: Nullable<JourneyVisitorSort>): JourneyVisitorsConnection | Promise<JourneyVisitorsConnection>;

    abstract journeyVisitorCount(filter: JourneyVisitorFilter): number | Promise<number>;

    abstract journeysEmailPreference(email: string): Nullable<JourneysEmailPreference> | Promise<Nullable<JourneysEmailPreference>>;

    abstract journeysPlausibleStatsRealtimeVisitors(id: string, idType?: Nullable<IdType>): number | Promise<number>;

    abstract journeysPlausibleStatsAggregate(where: PlausibleStatsAggregateFilter, id: string, idType?: Nullable<IdType>): PlausibleStatsAggregateResponse | Promise<PlausibleStatsAggregateResponse>;

    abstract journeysPlausibleStatsBreakdown(where: PlausibleStatsBreakdownFilter, id: string, idType?: Nullable<IdType>): PlausibleStatsResponse[] | Promise<PlausibleStatsResponse[]>;

    abstract journeysPlausibleStatsTimeseries(where: PlausibleStatsTimeseriesFilter, id: string, idType?: Nullable<IdType>): PlausibleStatsResponse[] | Promise<PlausibleStatsResponse[]>;

    abstract qrCode(id: string): QrCode | Promise<QrCode>;

    abstract qrCodes(where: QrCodesFilter): QrCode[] | Promise<QrCode[]>;

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

export class ButtonBlockSettings {
    __typename?: 'ButtonBlockSettings';
    alignment?: Nullable<ButtonAlignment>;
    color?: Nullable<string>;
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
    submitEnabled?: Nullable<boolean>;
    settings: ButtonBlockSettings;
}

export class CardBlock implements Block {
    __typename?: 'CardBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    backgroundColor?: Nullable<string>;
    backdropBlur?: Nullable<number>;
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
    gap: number;
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
    scale?: Nullable<number>;
    focalTop?: Nullable<number>;
    focalLeft?: Nullable<number>;
}

export class RadioOptionBlock implements Block {
    __typename?: 'RadioOptionBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    label: string;
    action?: Nullable<Action>;
    pollOptionImageBlockId?: Nullable<string>;
}

export class RadioQuestionBlock implements Block {
    __typename?: 'RadioQuestionBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    gridView?: Nullable<boolean>;
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

export class SpacerBlock implements Block {
    __typename?: 'SpacerBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    spacing?: Nullable<number>;
}

export class StepBlock implements Block {
    __typename?: 'StepBlock';
    id: string;
    journeyId: string;
    nextBlockId?: Nullable<string>;
    locked: boolean;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    x?: Nullable<number>;
    y?: Nullable<number>;
    slug?: Nullable<string>;
}

export class TextResponseBlock implements Block {
    __typename?: 'TextResponseBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder?: Nullable<number>;
    label: string;
    placeholder?: Nullable<string>;
    required?: Nullable<boolean>;
    hint?: Nullable<string>;
    minRows?: Nullable<number>;
    type?: Nullable<TextResponseType>;
    routeId?: Nullable<string>;
    integrationId?: Nullable<string>;
}

export class TypographyBlockSettings {
    __typename?: 'TypographyBlockSettings';
    color?: Nullable<string>;
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
    settings: TypographyBlockSettings;
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
    platform?: Nullable<MessagePlatform>;
}

export class CustomDomain {
    __typename?: 'CustomDomain';
    id: string;
    team: Team;
    name: string;
    apexName: string;
    journeyCollection?: Nullable<JourneyCollection>;
    routeAllTeamJourneys: boolean;
}

export class CustomDomainCheck {
    __typename?: 'CustomDomainCheck';
    configured: boolean;
    verified: boolean;
    verification?: Nullable<CustomDomainVerification[]>;
    verificationResponse?: Nullable<CustomDomainVerificationResponse>;
}

export class CustomDomainVerification {
    __typename?: 'CustomDomainVerification';
    type: string;
    domain: string;
    value: string;
    reason: string;
}

export class CustomDomainVerificationResponse {
    __typename?: 'CustomDomainVerificationResponse';
    code: string;
    message: string;
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

export class StepPreviousEvent implements Event {
    __typename?: 'StepPreviousEvent';
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
    blockId?: Nullable<string>;
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

export class IntegrationGrowthSpaces implements Integration {
    __typename?: 'IntegrationGrowthSpaces';
    id: string;
    team: Team;
    type: IntegrationType;
    accessId: string;
    accessSecretPart: string;
    routes: IntegrationGrowthSpacesRoute[];
}

export class IntegrationGrowthSpacesRoute {
    __typename?: 'IntegrationGrowthSpacesRoute';
    id: string;
    name: string;
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
    journeyNotification?: Nullable<JourneyNotification>;
    id: string;
    userId: string;
    journeyId: string;
    role: UserJourneyRole;
    user?: Nullable<User>;
    openedAt?: Nullable<DateTime>;
}

export class JourneyCollection {
    __typename?: 'JourneyCollection';
    id: string;
    team: Team;
    title?: Nullable<string>;
    customDomains?: Nullable<CustomDomain[]>;
    journeys?: Nullable<Journey[]>;
}

export class JourneyCustomizationField {
    __typename?: 'JourneyCustomizationField';
    id: string;
    journeyId: string;
    key: string;
    value?: Nullable<string>;
    defaultValue?: Nullable<string>;
}

export class JourneyEvent implements Event {
    __typename?: 'JourneyEvent';
    id: string;
    journeyId: string;
    createdAt: DateTime;
    label?: Nullable<string>;
    value?: Nullable<string>;
    action?: Nullable<ButtonAction>;
    actionValue?: Nullable<string>;
    messagePlatform?: Nullable<MessagePlatform>;
    language?: Nullable<Language>;
    email?: Nullable<string>;
    blockId?: Nullable<string>;
    position?: Nullable<number>;
    source?: Nullable<VideoBlockSource>;
    progress?: Nullable<number>;
    typename?: Nullable<string>;
    visitorId?: Nullable<string>;
    journeySlug?: Nullable<string>;
    visitorName?: Nullable<string>;
    visitorEmail?: Nullable<string>;
    visitorPhone?: Nullable<string>;
}

export class JourneyEventEdge {
    __typename?: 'JourneyEventEdge';
    cursor: string;
    node: JourneyEvent;
}

export class JourneyEventsConnection {
    __typename?: 'JourneyEventsConnection';
    edges: JourneyEventEdge[];
    pageInfo: PageInfo;
}

export class JourneyNotification {
    __typename?: 'JourneyNotification';
    id: string;
    userId: string;
    journeyId: string;
    userTeamId?: Nullable<string>;
    userJourneyId?: Nullable<string>;
    visitorInteractionEmail: boolean;
}

export class UserTeam {
    __typename?: 'UserTeam';
    journeyNotification?: Nullable<JourneyNotification>;
    id: string;
    user: User;
    role: UserTeamRole;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export class JourneyProfile {
    __typename?: 'JourneyProfile';
    id: string;
    userId: string;
    acceptedTermsAt?: Nullable<DateTime>;
    lastActiveTeamId?: Nullable<string>;
    journeyFlowBackButtonClicked?: Nullable<boolean>;
    plausibleJourneyFlowViewed?: Nullable<boolean>;
    plausibleDashboardViewed?: Nullable<boolean>;
}

export class JourneyTheme {
    __typename?: 'JourneyTheme';
    id: string;
    journeyId: string;
    journey: Journey;
    userId: string;
    headerFont?: Nullable<string>;
    bodyFont?: Nullable<string>;
    labelFont?: Nullable<string>;
    createdAt: DateTime;
    updatedAt: DateTime;
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

export class JourneysEmailPreference {
    __typename?: 'JourneysEmailPreference';
    email: string;
    unsubscribeAll: boolean;
    accountNotifications: boolean;
}

export class PlausibleStatsAggregateValue {
    __typename?: 'PlausibleStatsAggregateValue';
    value: number;
    change?: Nullable<number>;
}

export class PlausibleStatsAggregateResponse {
    __typename?: 'PlausibleStatsAggregateResponse';
    visitors?: Nullable<PlausibleStatsAggregateValue>;
    visits?: Nullable<PlausibleStatsAggregateValue>;
    pageviews?: Nullable<PlausibleStatsAggregateValue>;
    viewsPerVisit?: Nullable<PlausibleStatsAggregateValue>;
    bounceRate?: Nullable<PlausibleStatsAggregateValue>;
    visitDuration?: Nullable<PlausibleStatsAggregateValue>;
    events?: Nullable<PlausibleStatsAggregateValue>;
    conversionRate?: Nullable<PlausibleStatsAggregateValue>;
    timeOnPage?: Nullable<PlausibleStatsAggregateValue>;
}

export class PlausibleStatsResponse {
    __typename?: 'PlausibleStatsResponse';
    property: string;
    visitors?: Nullable<number>;
    visits?: Nullable<number>;
    pageviews?: Nullable<number>;
    viewsPerVisit?: Nullable<number>;
    bounceRate?: Nullable<number>;
    visitDuration?: Nullable<number>;
    events?: Nullable<number>;
    conversionRate?: Nullable<number>;
    timeOnPage?: Nullable<number>;
}

export class QrCode {
    __typename?: 'QrCode';
    id: string;
    team?: Nullable<Team>;
    journey?: Nullable<Journey>;
    shortLink: ShortLink;
    color?: Nullable<string>;
    backgroundColor?: Nullable<string>;
    toJourneyId?: Nullable<string>;
}

export class Team {
    __typename?: 'Team';
    id: string;
    title: string;
    publicTitle?: Nullable<string>;
    createdAt: DateTime;
    updatedAt: DateTime;
    userTeams: UserTeam[];
    customDomains: CustomDomain[];
    integrations: Integration[];
    qrCodes: QrCode[];
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
    hasPreviousPage: boolean;
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

export class ShortLink {
    id: string;
}

export class User {
    id: string;
}

export type DateTime = String;
export type Json = any;

export class ISchema {
    Query: IQuery;
    Mutation: IMutation;
}

type Nullable<T> = T | null;
