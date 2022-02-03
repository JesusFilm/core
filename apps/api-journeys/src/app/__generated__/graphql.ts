
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
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

export class ImageBlockCreateInput {
    id?: Nullable<string>;
    parentBlockId: string;
    journeyId: string;
    parentOrder: number;
    src: string;
    alt: string;
}

export class ImageBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    src?: Nullable<string>;
    alt?: Nullable<string>;
}

export class SignUpBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
    submitLabel: string;
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

export class VideoContentInput {
    mediaComponentId?: Nullable<string>;
    languageId?: Nullable<string>;
    src?: Nullable<string>;
}

export class VideoBlockCreateInput {
    id?: Nullable<string>;
    journeyId: string;
    parentBlockId: string;
    parentOrder: number;
    title: string;
    startAt?: Nullable<number>;
    endAt?: Nullable<number>;
    description?: Nullable<string>;
    muted?: Nullable<boolean>;
    autoplay?: Nullable<boolean>;
    videoContent: VideoContentInput;
    posterBlockId?: Nullable<string>;
}

export class VideoBlockUpdateInput {
    parentBlockId?: Nullable<string>;
    title?: Nullable<string>;
    startAt?: Nullable<number>;
    endAt?: Nullable<number>;
    description?: Nullable<string>;
    muted?: Nullable<boolean>;
    autoplay?: Nullable<boolean>;
    videoContent?: Nullable<VideoContentInput>;
    posterBlockId?: Nullable<string>;
}

export class JourneyCreateInput {
    id?: Nullable<string>;
    title: string;
    locale?: Nullable<string>;
    themeMode?: Nullable<ThemeMode>;
    themeName?: Nullable<ThemeName>;
    description?: Nullable<string>;
    slug: string;
}

export class JourneyUpdateInput {
    title?: Nullable<string>;
    locale?: Nullable<string>;
    themeMode?: Nullable<ThemeMode>;
    themeName?: Nullable<ThemeName>;
    description?: Nullable<string>;
    primaryImageBlockId?: Nullable<string>;
    slug?: Nullable<string>;
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
    gtmEventName?: Nullable<string>;
}

export interface Block {
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder: number;
}

export interface VideoContent {
    src: string;
}

export interface Response {
    id: string;
    userId: string;
}

export class Icon {
    __typename?: 'Icon';
    name: IconName;
    color?: Nullable<IconColor>;
    size?: Nullable<IconSize>;
}

export class NavigateAction implements Action {
    __typename?: 'NavigateAction';
    gtmEventName?: Nullable<string>;
}

export class NavigateToBlockAction implements Action {
    __typename?: 'NavigateToBlockAction';
    gtmEventName?: Nullable<string>;
    blockId: string;
}

export class NavigateToJourneyAction implements Action {
    __typename?: 'NavigateToJourneyAction';
    gtmEventName?: Nullable<string>;
    journeyId: string;
    journey?: Nullable<Journey>;
}

export class LinkAction implements Action {
    __typename?: 'LinkAction';
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
    parentOrder: number;
    label: string;
    variant?: Nullable<ButtonVariant>;
    color?: Nullable<ButtonColor>;
    size?: Nullable<ButtonSize>;
    startIcon?: Nullable<Icon>;
    endIcon?: Nullable<Icon>;
    action?: Nullable<Action>;
}

export class CardBlock implements Block {
    __typename?: 'CardBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder: number;
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
    parentOrder: number;
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
    parentOrder: number;
    xl: number;
    lg: number;
    sm: number;
}

export class ImageBlock implements Block {
    __typename?: 'ImageBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder: number;
    src: string;
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
    parentOrder: number;
    label: string;
    action?: Nullable<Action>;
}

export class RadioQuestionBlock implements Block {
    __typename?: 'RadioQuestionBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder: number;
    label: string;
    description?: Nullable<string>;
}

export class SignUpBlock implements Block {
    __typename?: 'SignUpBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder: number;
    action?: Nullable<Action>;
    submitIcon?: Nullable<Icon>;
    submitLabel?: Nullable<string>;
}

export class StepBlock implements Block {
    __typename?: 'StepBlock';
    id: string;
    journeyId: string;
    nextBlockId?: Nullable<string>;
    locked: boolean;
    parentBlockId?: Nullable<string>;
    parentOrder: number;
}

export class TypographyBlock implements Block {
    __typename?: 'TypographyBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder: number;
    content: string;
    variant?: Nullable<TypographyVariant>;
    color?: Nullable<TypographyColor>;
    align?: Nullable<TypographyAlign>;
}

export class VideoArclight implements VideoContent {
    __typename?: 'VideoArclight';
    mediaComponentId: string;
    languageId: string;
    src: string;
}

export class VideoGeneric implements VideoContent {
    __typename?: 'VideoGeneric';
    src: string;
}

export class VideoBlock implements Block {
    __typename?: 'VideoBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder: number;
    title: string;
    startAt?: Nullable<number>;
    endAt?: Nullable<number>;
    description?: Nullable<string>;
    muted?: Nullable<boolean>;
    autoplay?: Nullable<boolean>;
    videoContent: VideoContent;
    posterBlockId?: Nullable<string>;
}

export class VideoTriggerBlock implements Block {
    __typename?: 'VideoTriggerBlock';
    id: string;
    journeyId: string;
    parentBlockId?: Nullable<string>;
    parentOrder: number;
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
    abstract blockOrderUpdate(id: string, journeyId: string, parentOrder: number): Block[] | Promise<Block[]>;

    abstract cardBlockCreate(input: CardBlockCreateInput): CardBlock | Promise<CardBlock>;

    abstract cardBlockUpdate(id: string, journeyId: string, input: CardBlockUpdateInput): CardBlock | Promise<CardBlock>;

    abstract imageBlockCreate(input: ImageBlockCreateInput): ImageBlock | Promise<ImageBlock>;

    abstract imageBlockUpdate(id: string, journeyId: string, input: ImageBlockUpdateInput): ImageBlock | Promise<ImageBlock>;

    abstract signUpBlockCreate(input: SignUpBlockCreateInput): SignUpBlock | Promise<SignUpBlock>;

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
