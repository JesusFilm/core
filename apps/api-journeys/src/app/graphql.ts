
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

export class CardBlockCreateInput {
    id?: Nullable<string>;
    parentBlockId?: Nullable<string>;
    type?: Nullable<string>;
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
    parentBlockId?: Nullable<string>;
    journeyId: string;
    src: string;
    alt: string;
}

export class StepBlockCreatInput {
    id?: Nullable<string>;
    type?: Nullable<string>;
    nextBlockId?: Nullable<string>;
    locked?: Nullable<boolean>;
    parentBlockId?: Nullable<string>;
}

export class StepBlockUpdateInput {
    nextBlockId?: Nullable<string>;
    locked?: Nullable<boolean>;
    parentBlockId?: Nullable<string>;
}

export class JourneyCreateInput {
    id?: Nullable<string>;
    title?: Nullable<string>;
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
}

export class RadioQuestionResponseCreateInput {
    id?: Nullable<string>;
    blockId: string;
    type?: Nullable<string>;
    radioOptionBlockId: string;
}

export class SignUpResponseCreateInput {
    id?: Nullable<string>;
    blockId: string;
    type?: Nullable<string>;
    name: string;
    email: string;
}

export class VideoResponseCreateInput {
    id?: Nullable<string>;
    blockId: string;
    type?: Nullable<string>;
    state: VideoResponseStateEnum;
    position?: Nullable<number>;
}

export interface Action {
    gtmEventName?: Nullable<string>;
}

export interface Block {
    id: string;
    type: string;
    parentBlockId?: Nullable<string>;
}

export interface VideoContent {
    src: string;
}

export interface Response {
    id: string;
    userId: string;
    type: string;
}

export class Icon {
    name: IconName;
    color?: Nullable<IconColor>;
    size?: Nullable<IconSize>;
}

export class NavigateAction implements Action {
    gtmEventName?: Nullable<string>;
}

export class NavigateToBlockAction implements Action {
    gtmEventName?: Nullable<string>;
    blockId: string;
}

export class NavigateToJourneyAction implements Action {
    gtmEventName?: Nullable<string>;
    journeyId: string;
    journey?: Nullable<Journey>;
}

export class LinkAction implements Action {
    gtmEventName?: Nullable<string>;
    url: string;
    target?: Nullable<string>;
}

export class Journey {
    blocks?: Nullable<Block[]>;
    primaryImageBlock?: Nullable<ImageBlock>;
    id: string;
    published: boolean;
    title: string;
    locale: string;
    themeMode: ThemeMode;
    themeName: ThemeName;
    description?: Nullable<string>;
    slug: string;
    publishedAt?: Nullable<DateTime>;
    createdAt: DateTime;
    status: JourneyStatus;
}

export class ButtonBlock implements Block {
    id: string;
    parentBlockId?: Nullable<string>;
    type: string;
    label: string;
    variant?: Nullable<ButtonVariant>;
    color?: Nullable<ButtonColor>;
    size?: Nullable<ButtonSize>;
    startIcon?: Nullable<Icon>;
    endIcon?: Nullable<Icon>;
    action?: Nullable<Action>;
}

export class CardBlock implements Block {
    id: string;
    parentBlockId?: Nullable<string>;
    type: string;
    backgroundColor?: Nullable<string>;
    coverBlockId?: Nullable<string>;
    fullscreen: boolean;
    themeMode?: Nullable<ThemeMode>;
    themeName?: Nullable<ThemeName>;
}

export class GridContainerBlock implements Block {
    id: string;
    parentBlockId?: Nullable<string>;
    type: string;
    spacing: number;
    direction: GridDirection;
    justifyContent: GridJustifyContent;
    alignItems: GridAlignItems;
}

export class GridItemBlock implements Block {
    id: string;
    type: string;
    parentBlockId?: Nullable<string>;
    xl: number;
    lg: number;
    sm: number;
}

export class ImageBlock implements Block {
    id: string;
    type: string;
    parentBlockId?: Nullable<string>;
    src: string;
    width: number;
    height: number;
    alt: string;
    blurhash: string;
}

export class RadioOptionBlock implements Block {
    id: string;
    type: string;
    parentBlockId?: Nullable<string>;
    label: string;
    action?: Nullable<Action>;
}

export class RadioQuestionBlock implements Block {
    id: string;
    type: string;
    parentBlockId?: Nullable<string>;
    label: string;
    description?: Nullable<string>;
}

export class SignUpBlock implements Block {
    id: string;
    parentBlockId?: Nullable<string>;
    type: string;
    action?: Nullable<Action>;
    submitIcon?: Nullable<Icon>;
    submitLabel?: Nullable<string>;
}

export class StepBlock implements Block {
    id: string;
    type: string;
    nextBlockId?: Nullable<string>;
    locked: boolean;
    parentBlockId?: Nullable<string>;
}

export class TypographyBlock implements Block {
    id: string;
    parentBlockId?: Nullable<string>;
    type: string;
    content: string;
    variant?: Nullable<TypographyVariant>;
    color?: Nullable<TypographyColor>;
    align?: Nullable<TypographyAlign>;
}

export class VideoArclight implements VideoContent {
    mediaComponentId: string;
    languageId: string;
    src: string;
}

export class VideoGeneric implements VideoContent {
    src: string;
}

export class VideoBlock implements Block {
    id: string;
    parentBlockId?: Nullable<string>;
    type: string;
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
    id: string;
    parentBlockId?: Nullable<string>;
    type: string;
    triggerStart: number;
    action?: Nullable<Action>;
}

export class RadioQuestionResponse implements Response {
    id: string;
    userId: string;
    type: string;
    radioOptionBlockId: string;
    block?: Nullable<RadioQuestionBlock>;
}

export class SignUpResponse implements Response {
    id: string;
    userId: string;
    type: string;
    name: string;
    email: string;
    block?: Nullable<SignUpBlock>;
}

export class VideoResponse implements Response {
    id: string;
    userId: string;
    type: string;
    state: VideoResponseStateEnum;
    position?: Nullable<number>;
    block?: Nullable<VideoBlock>;
}

export abstract class IMutation {
    abstract cardBlockCreate(input: CardBlockCreateInput): CardBlock | Promise<CardBlock>;

    abstract cardBlockUpdate(id: string, input: CardBlockUpdateInput): CardBlock | Promise<CardBlock>;

    abstract imageBlockCreate(input: ImageBlockCreateInput): ImageBlock | Promise<ImageBlock>;

    abstract stepBlockCreate(input: StepBlockCreatInput): StepBlock | Promise<StepBlock>;

    abstract stepBlockUpdate(id: string, input: StepBlockUpdateInput): StepBlock | Promise<StepBlock>;

    abstract journeyCreate(input: JourneyCreateInput): Journey | Promise<Journey>;

    abstract journeyUpdate(id: string, input: JourneyUpdateInput): Journey | Promise<Journey>;

    abstract journeyPublish(id: string): Nullable<Journey> | Promise<Nullable<Journey>>;

    abstract radioQuestionResponseCreate(input: RadioQuestionResponseCreateInput): RadioQuestionResponse | Promise<RadioQuestionResponse>;

    abstract signUpResponseCreate(input: SignUpResponseCreateInput): SignUpResponse | Promise<SignUpResponse>;

    abstract videoResponseCreate(input: VideoResponseCreateInput): VideoResponse | Promise<VideoResponse>;
}

export abstract class IQuery {
    abstract journeys(status?: Nullable<JourneyStatus>): Journey[] | Promise<Journey[]>;

    abstract journey(id: string, idType?: Nullable<IdType>): Nullable<Journey> | Promise<Nullable<Journey>>;
}

export type DateTime = String;
type Nullable<T> = T | null;
