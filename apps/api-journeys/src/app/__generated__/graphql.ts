
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
    draft = "draft",
    published = "published"
}

export enum VideoResponseStateEnum {
    PLAYING = "PLAYING",
    PAUSED = "PAUSED",
    FINISHED = "FINISHED"
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
    coverBlockId?: Nullable<string>;
    fullscreen?: Nullable<boolean>;
    themeMode?: Nullable<ThemeMode>;
    themeName?: Nullable<ThemeName>;
}

export class CardBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    backgroundColor?: Nullable<string>;
    coverBlockId?: Nullable<string>;
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
    label: string;
}

export class RadioOptionBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    label?: Nullable<string>;
}

export class RadioQuestionBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    label?: Nullable<string>;
    description?: Nullable<string>;
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

export class JourneyCreateInput {
    id?: Nullable<string>;
    title: string;
    locale?: Nullable<string>;
    themeMode?: Nullable<ThemeMode>;
    themeName?: Nullable<ThemeName>;
    description?: Nullable<string>;
    slug?: Nullable<string>;
}

export class JourneyUpdateInput {
    title?: Nullable<string>;
    locale?: Nullable<string>;
    themeMode?: Nullable<ThemeMode>;
    themeName?: Nullable<ThemeName>;
    description?: Nullable<string>;
    primaryImageBlockId?: Nullable<string>;
    slug?: Nullable<string>;
    seoTitle?: Nullable<string>;
    seoDescription?: Nullable<string>;
}

export class RadioQuestionResponseCreateInput {
    id?: Nullable<string>;
    blockId: string;
    radioOptionBlockId: string;
}

export class SignUpResponseCreateInput {
    id?: Nullable<string>;
    blockId: string;
    name: string;
    email: string;
}

export class VideoResponseCreateInput {
    id?: Nullable<string>;
    blockId: string;
    state: VideoResponseStateEnum;
    position?: Nullable<number>;
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

export interface Response {
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
    locale: string;
    themeMode: ThemeMode;
    themeName: ThemeName;
    description?: Nullable<string>;
    slug: string;
    publishedAt?: Nullable<DateTime>;
    createdAt: DateTime;
    status: JourneyStatus;
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
    label: string;
    description?: Nullable<string>;
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

export class UserJourney {
    __typename?: 'UserJourney';
    journey?: Nullable<Journey>;
    id: string;
    userId: string;
    journeyId: string;
    role: UserJourneyRole;
    user?: Nullable<User>;
}

export class RadioQuestionResponse implements Response {
    __typename?: 'RadioQuestionResponse';
    id: string;
    userId: string;
    radioOptionBlockId: string;
    block?: Nullable<RadioQuestionBlock>;
}

export class SignUpResponse implements Response {
    __typename?: 'SignUpResponse';
    id: string;
    userId: string;
    name: string;
    email: string;
    block?: Nullable<SignUpBlock>;
}

export class VideoResponse implements Response {
    __typename?: 'VideoResponse';
    id: string;
    userId: string;
    state: VideoResponseStateEnum;
    position?: Nullable<number>;
    block?: Nullable<VideoBlock>;
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

    abstract radioQuestionBlockUpdate(id: string, journeyId: string, input: RadioQuestionBlockUpdateInput): RadioQuestionBlock | Promise<RadioQuestionBlock>;

    abstract signUpBlockCreate(input: SignUpBlockCreateInput): SignUpBlock | Promise<SignUpBlock>;

    abstract signUpBlockUpdate(id: string, journeyId: string, input: SignUpBlockUpdateInput): Nullable<SignUpBlock> | Promise<Nullable<SignUpBlock>>;

    abstract stepBlockCreate(input: StepBlockCreateInput): StepBlock | Promise<StepBlock>;

    abstract stepBlockUpdate(id: string, journeyId: string, input: StepBlockUpdateInput): StepBlock | Promise<StepBlock>;

    abstract typographyBlockCreate(input: TypographyBlockCreateInput): TypographyBlock | Promise<TypographyBlock>;

    abstract typographyBlockUpdate(id: string, journeyId: string, input: TypographyBlockUpdateInput): TypographyBlock | Promise<TypographyBlock>;

    abstract videoBlockCreate(input: VideoBlockCreateInput): VideoBlock | Promise<VideoBlock>;

    abstract videoBlockUpdate(id: string, journeyId: string, input: VideoBlockUpdateInput): VideoBlock | Promise<VideoBlock>;

    abstract journeyCreate(input: JourneyCreateInput): Journey | Promise<Journey>;

    abstract journeyUpdate(id: string, input: JourneyUpdateInput): Journey | Promise<Journey>;

    abstract journeyPublish(id: string): Nullable<Journey> | Promise<Nullable<Journey>>;

    abstract radioQuestionResponseCreate(input: RadioQuestionResponseCreateInput): RadioQuestionResponse | Promise<RadioQuestionResponse>;

    abstract signUpResponseCreate(input: SignUpResponseCreateInput): SignUpResponse | Promise<SignUpResponse>;

    abstract videoResponseCreate(input: VideoResponseCreateInput): VideoResponse | Promise<VideoResponse>;

    abstract userJourneyApprove(id: string): UserJourney | Promise<UserJourney>;

    abstract userJourneyPromote(id: string): UserJourney | Promise<UserJourney>;

    abstract userJourneyRemove(id: string): UserJourney | Promise<UserJourney>;

    abstract userJourneyRequest(journeyId: string, idType?: Nullable<IdType>): UserJourney | Promise<UserJourney>;
}

export class Video {
    id: string;
    primaryLanguageId: string;
}

export abstract class IQuery {
    abstract adminJourneys(): Journey[] | Promise<Journey[]>;

    abstract adminJourney(id: string, idType?: Nullable<IdType>): Nullable<Journey> | Promise<Nullable<Journey>>;

    abstract journeys(): Journey[] | Promise<Journey[]>;

    abstract journey(id: string, idType?: Nullable<IdType>): Nullable<Journey> | Promise<Nullable<Journey>>;
}

export class User {
    id: string;
}

export type DateTime = String;
type Nullable<T> = T | null;
