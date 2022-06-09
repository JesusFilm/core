
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
    ChatBubbleOutlineRounded = "ChatBubbleOutlineRounded",
    LiveTvRounded = "LiveTvRounded",
    MenuBookRounded = "MenuBookRounded",
    ChevronRightRounded = "ChevronRightRounded",
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

export enum UserJourneyRole {
    inviteRequested = "inviteRequested",
    editor = "editor",
    owner = "owner"
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
    parentBlockId: string;
    journeyId: string;
    src?: Nullable<string>;
    alt: string;
    blurhash?: Nullable<string>;
    isCover?: Nullable<boolean>;
}

export class ImageBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    src?: Nullable<string>;
    alt?: Nullable<string>;
}

export class RadioOptionBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
    label: string;
}

export class RadioQuestionBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
}

export class RadioOptionBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    label?: Nullable<string>;
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
    description?: Nullable<string>;
    muted?: Nullable<boolean>;
    autoplay?: Nullable<boolean>;
    videoId?: Nullable<string>;
    videoVariantLanguageId?: Nullable<string>;
    posterBlockId?: Nullable<string>;
    fullsize?: Nullable<boolean>;
    isCover?: Nullable<boolean>;
}

export class VideoBlockUpdateInput {
    startAt?: Nullable<number>;
    endAt?: Nullable<number>;
    muted?: Nullable<boolean>;
    autoplay?: Nullable<boolean>;
    videoId?: Nullable<string>;
    videoVariantLanguageId?: Nullable<string>;
    posterBlockId?: Nullable<string>;
    fullsize?: Nullable<boolean>;
}

export class ButtonClickEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
}

export class JourneyViewEventCreateInput {
    id?: Nullable<string>;
    journeyId: string;
}

export class RadioQuestionSubmissionEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    radioOptionBlockId: string;
}

export class SignUpSubmissionEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    name: string;
    email: string;
}

export class StepViewEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
}

export class VideoStartEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    position?: Nullable<number>;
}

export class VideoPlayEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    position?: Nullable<number>;
}

export class VideoPauseEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    position?: Nullable<number>;
}

export class VideoCompleteEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    position?: Nullable<number>;
}

export class VideoExpandEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    position?: Nullable<number>;
}

export class VideoCollapseEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    position?: Nullable<number>;
}

export class VideoProgressEventCreateInput {
    id?: Nullable<string>;
    blockId: string;
    position?: Nullable<number>;
    progress: number;
}

export class JourneysFilter {
    featured?: Nullable<boolean>;
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
    userId: string;
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

export class Journey {
    __typename?: 'Journey';
    blocks?: Nullable<Block[]>;
    primaryImageBlock?: Nullable<ImageBlock>;
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
    action?: Nullable<Action>;
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

export class ButtonClickEvent implements Event {
    __typename?: 'ButtonClickEvent';
    id: string;
    userId: string;
    block?: Nullable<ButtonBlock>;
}

export class JourneyViewEvent implements Event {
    __typename?: 'JourneyViewEvent';
    id: string;
    userId: string;
    journey?: Nullable<Journey>;
}

export class RadioQuestionSubmissionEvent implements Event {
    __typename?: 'RadioQuestionSubmissionEvent';
    id: string;
    userId: string;
    radioOptionBlockId: string;
    block?: Nullable<RadioQuestionBlock>;
}

export class SignUpSubmissionEvent implements Event {
    __typename?: 'SignUpSubmissionEvent';
    id: string;
    userId: string;
    name: string;
    email: string;
    block?: Nullable<SignUpBlock>;
}

export class StepViewEvent implements Event {
    __typename?: 'StepViewEvent';
    id: string;
    userId: string;
    block?: Nullable<StepBlock>;
}

export class VideoStartEvent implements Event {
    __typename?: 'VideoStartEvent';
    id: string;
    userId: string;
    position?: Nullable<number>;
    block?: Nullable<VideoBlock>;
}

export class VideoPlayEvent implements Event {
    __typename?: 'VideoPlayEvent';
    id: string;
    userId: string;
    position?: Nullable<number>;
    block?: Nullable<VideoBlock>;
}

export class VideoPauseEvent implements Event {
    __typename?: 'VideoPauseEvent';
    id: string;
    userId: string;
    position?: Nullable<number>;
    block?: Nullable<VideoBlock>;
}

export class VideoCompleteEvent implements Event {
    __typename?: 'VideoCompleteEvent';
    id: string;
    userId: string;
    position?: Nullable<number>;
    block?: Nullable<VideoBlock>;
}

export class VideoExpandEvent implements Event {
    __typename?: 'VideoExpandEvent';
    id: string;
    userId: string;
    position?: Nullable<number>;
    block?: Nullable<VideoBlock>;
}

export class VideoCollapseEvent implements Event {
    __typename?: 'VideoCollapseEvent';
    id: string;
    userId: string;
    position?: Nullable<number>;
    block?: Nullable<VideoBlock>;
}

export class VideoProgressEvent implements Event {
    __typename?: 'VideoProgressEvent';
    id: string;
    userId: string;
    position?: Nullable<number>;
    progress: number;
    block?: Nullable<VideoBlock>;
}

export class UserJourney {
    __typename?: 'UserJourney';
    journey?: Nullable<Journey>;
    id: string;
    userId: string;
    journeyId: string;
    role: UserJourneyRole;
    user?: Nullable<User>;
}

export abstract class IMutation {
    abstract blockDeleteAction(id: string, journeyId: string): Block | Promise<Block>;

    abstract blockUpdateNavigateAction(id: string, journeyId: string, input: NavigateActionInput): NavigateAction | Promise<NavigateAction>;

    abstract blockUpdateNavigateToBlockAction(id: string, journeyId: string, input: NavigateToBlockActionInput): NavigateToBlockAction | Promise<NavigateToBlockAction>;

    abstract blockUpdateNavigateToJourneyAction(id: string, journeyId: string, input: NavigateToJourneyActionInput): NavigateToJourneyAction | Promise<NavigateToJourneyAction>;

    abstract blockUpdateLinkAction(id: string, journeyId: string, input: LinkActionInput): LinkAction | Promise<LinkAction>;

    abstract blockDelete(id: string, journeyId: string, parentBlockId?: Nullable<string>): Block[] | Promise<Block[]>;

    abstract blockOrderUpdate(id: string, journeyId: string, parentOrder: number): Block[] | Promise<Block[]>;

    abstract buttonBlockCreate(input: ButtonBlockCreateInput): ButtonBlock | Promise<ButtonBlock>;

    abstract buttonBlockUpdate(id: string, journeyId: string, input: ButtonBlockUpdateInput): Nullable<ButtonBlock> | Promise<Nullable<ButtonBlock>>;

    abstract cardBlockCreate(input: CardBlockCreateInput): CardBlock | Promise<CardBlock>;

    abstract cardBlockUpdate(id: string, journeyId: string, input: CardBlockUpdateInput): CardBlock | Promise<CardBlock>;

    abstract iconBlockCreate(input: IconBlockCreateInput): IconBlock | Promise<IconBlock>;

    abstract iconBlockUpdate(id: string, journeyId: string, input: IconBlockUpdateInput): IconBlock | Promise<IconBlock>;

    abstract imageBlockCreate(input: ImageBlockCreateInput): ImageBlock | Promise<ImageBlock>;

    abstract imageBlockUpdate(id: string, journeyId: string, input: ImageBlockUpdateInput): ImageBlock | Promise<ImageBlock>;

    abstract radioOptionBlockCreate(input: RadioOptionBlockCreateInput): RadioOptionBlock | Promise<RadioOptionBlock>;

    abstract radioQuestionBlockCreate(input: RadioQuestionBlockCreateInput): RadioQuestionBlock | Promise<RadioQuestionBlock>;

    abstract radioOptionBlockUpdate(id: string, journeyId: string, input: RadioOptionBlockUpdateInput): RadioOptionBlock | Promise<RadioOptionBlock>;

    abstract radioQuestionBlockUpdate(id: string, journeyId: string, parentBlockId: string): RadioQuestionBlock | Promise<RadioQuestionBlock>;

    abstract signUpBlockCreate(input: SignUpBlockCreateInput): SignUpBlock | Promise<SignUpBlock>;

    abstract signUpBlockUpdate(id: string, journeyId: string, input: SignUpBlockUpdateInput): Nullable<SignUpBlock> | Promise<Nullable<SignUpBlock>>;

    abstract stepBlockCreate(input: StepBlockCreateInput): StepBlock | Promise<StepBlock>;

    abstract stepBlockUpdate(id: string, journeyId: string, input: StepBlockUpdateInput): StepBlock | Promise<StepBlock>;

    abstract typographyBlockCreate(input: TypographyBlockCreateInput): TypographyBlock | Promise<TypographyBlock>;

    abstract typographyBlockUpdate(id: string, journeyId: string, input: TypographyBlockUpdateInput): TypographyBlock | Promise<TypographyBlock>;

    abstract videoBlockCreate(input: VideoBlockCreateInput): VideoBlock | Promise<VideoBlock>;

    abstract videoBlockUpdate(id: string, journeyId: string, input: VideoBlockUpdateInput): VideoBlock | Promise<VideoBlock>;

    abstract buttonClickEventCreate(input: ButtonClickEventCreateInput): ButtonClickEvent | Promise<ButtonClickEvent>;

    abstract journeyViewEventCreate(input: JourneyViewEventCreateInput): JourneyViewEvent | Promise<JourneyViewEvent>;

    abstract radioQuestionSubmissionEventCreate(input: RadioQuestionSubmissionEventCreateInput): RadioQuestionSubmissionEvent | Promise<RadioQuestionSubmissionEvent>;

    abstract signUpSubmissionEventCreate(input: SignUpSubmissionEventCreateInput): SignUpSubmissionEvent | Promise<SignUpSubmissionEvent>;

    abstract stepViewEventCreate(input: StepViewEventCreateInput): StepViewEvent | Promise<StepViewEvent>;

    abstract videoStartEventCreate(input: VideoStartEventCreateInput): VideoStartEvent | Promise<VideoStartEvent>;

    abstract videoPlayEventCreate(input: VideoPlayEventCreateInput): VideoPlayEvent | Promise<VideoPlayEvent>;

    abstract videoPauseEventCreate(input: VideoPauseEventCreateInput): VideoPauseEvent | Promise<VideoPauseEvent>;

    abstract videoCompleteEventCreate(input: VideoCompleteEventCreateInput): VideoCompleteEvent | Promise<VideoCompleteEvent>;

    abstract videoExpandEventCreate(input: VideoExpandEventCreateInput): VideoExpandEvent | Promise<VideoExpandEvent>;

    abstract videoCollapseEventCreate(input: VideoCollapseEventCreateInput): VideoCollapseEvent | Promise<VideoCollapseEvent>;

    abstract videoProgressEventCreate(input: VideoProgressEventCreateInput): VideoProgressEvent | Promise<VideoProgressEvent>;

    abstract journeyCreate(input: JourneyCreateInput): Journey | Promise<Journey>;

    abstract journeyUpdate(id: string, input: JourneyUpdateInput): Journey | Promise<Journey>;

    abstract journeyPublish(id: string): Nullable<Journey> | Promise<Nullable<Journey>>;

    abstract journeyArchive(id: string): Nullable<Journey> | Promise<Nullable<Journey>>;

    abstract journeyArchiveAllActive(): Nullable<Nullable<Journey>[]> | Promise<Nullable<Nullable<Journey>[]>>;

    abstract journeyDelete(id: string): Nullable<Journey> | Promise<Nullable<Journey>>;

    abstract journeyTrash(id: string): Nullable<Journey> | Promise<Nullable<Journey>>;

    abstract journeyRestore(id: string): Nullable<Journey> | Promise<Nullable<Journey>>;

    abstract journeyTrashAllArchived(): Nullable<Nullable<Journey>[]> | Promise<Nullable<Nullable<Journey>[]>>;

    abstract userJourneyApprove(id: string): UserJourney | Promise<UserJourney>;

    abstract userJourneyPromote(id: string): UserJourney | Promise<UserJourney>;

    abstract userJourneyRemove(id: string): UserJourney | Promise<UserJourney>;

    abstract userJourneyRequest(journeyId: string, idType?: Nullable<IdType>): UserJourney | Promise<UserJourney>;
}

export class Video {
    id: string;
    primaryLanguageId: string;
}

export class Language {
    id: string;
}

export abstract class IQuery {
    abstract adminJourneys(status?: Nullable<JourneyStatus[]>): Journey[] | Promise<Journey[]>;

    abstract adminJourney(id: string, idType?: Nullable<IdType>): Nullable<Journey> | Promise<Nullable<Journey>>;

    abstract journeys(where?: Nullable<JourneysFilter>): Journey[] | Promise<Journey[]>;

    abstract journey(id: string, idType?: Nullable<IdType>): Nullable<Journey> | Promise<Nullable<Journey>>;
}

export class User {
    id: string;
}

export type DateTime = String;
type Nullable<T> = T | null;
