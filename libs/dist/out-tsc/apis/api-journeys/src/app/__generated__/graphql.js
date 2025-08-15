"use strict";
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignUpBlockCreateInput = exports.RadioQuestionBlockCreateInput = exports.RadioOptionBlockUpdateInput = exports.RadioOptionBlockCreateInput = exports.ImageBlockUpdateInput = exports.ImageBlockCreateInput = exports.IconBlockUpdateInput = exports.IconBlockCreateInput = exports.CardBlockUpdateInput = exports.CardBlockCreateInput = exports.ButtonBlockUpdateInput = exports.ButtonBlockCreateInput = exports.ButtonBlockSettingsInput = exports.BlockDuplicateIdMap = exports.BlocksFilter = exports.BlockUpdateActionInput = exports.EmailActionInput = exports.LinkActionInput = exports.NavigateToBlockActionInput = exports.VisitorStatus = exports.DeviceType = exports.UserTeamRole = exports.Role = exports.UserJourneyRole = exports.JourneyVisitorSort = exports.JourneysReportType = exports.JourneyStatus = exports.IdType = exports.JourneyMenuButtonIcon = exports.IntegrationType = exports.MessagePlatform = exports.ButtonAction = exports.VideoBlockObjectFit = exports.VideoBlockSource = exports.TypographyAlign = exports.TypographyColor = exports.TypographyVariant = exports.TextResponseType = exports.IconSize = exports.IconColor = exports.IconName = exports.GridAlignItems = exports.GridJustifyContent = exports.GridDirection = exports.ButtonAlignment = exports.ButtonSize = exports.ButtonColor = exports.ButtonVariant = exports.ThemeName = exports.ThemeMode = void 0;
exports.JourneyThemeUpdateInput = exports.JourneyThemeCreateInput = exports.JourneyProfileUpdateInput = exports.JourneyNotificationUpdateInput = exports.JourneyEventsFilter = exports.JourneyCustomizationFieldInput = exports.JourneyCollectionUpdateInput = exports.JourneyCollectionCreateInput = exports.JourneyTemplateInput = exports.JourneyUpdateInput = exports.JourneyCreateInput = exports.JourneysQueryOptions = exports.JourneysFilter = exports.IntegrationGrowthSpacesUpdateInput = exports.IntegrationGrowthSpacesCreateInput = exports.HostCreateInput = exports.HostUpdateInput = exports.VideoProgressEventCreateInput = exports.VideoCollapseEventCreateInput = exports.VideoExpandEventCreateInput = exports.VideoCompleteEventCreateInput = exports.VideoPauseEventCreateInput = exports.VideoPlayEventCreateInput = exports.VideoStartEventCreateInput = exports.TextResponseSubmissionEventCreateInput = exports.StepPreviousEventCreateInput = exports.StepNextEventCreateInput = exports.StepViewEventCreateInput = exports.SignUpSubmissionEventCreateInput = exports.RadioQuestionSubmissionEventCreateInput = exports.JourneyViewEventCreateInput = exports.ChatOpenEventCreateInput = exports.ButtonClickEventCreateInput = exports.CustomDomainUpdateInput = exports.CustomDomainCreateInput = exports.ChatButtonUpdateInput = exports.ChatButtonCreateInput = exports.VideoBlockUpdateInput = exports.VideoBlockCreateInput = exports.TypographyBlockUpdateInput = exports.TypographyBlockCreateInput = exports.TypographyBlockSettingsInput = exports.TextResponseBlockUpdateInput = exports.TextResponseBlockCreateInput = exports.StepBlockPositionUpdateInput = exports.StepBlockUpdateInput = exports.StepBlockCreateInput = exports.SpacerBlockUpdateInput = exports.SpacerBlockCreateInput = exports.SignUpBlockUpdateInput = void 0;
exports.StepNextEvent = exports.StepViewEvent = exports.SignUpSubmissionEvent = exports.RadioQuestionSubmissionEvent = exports.JourneyViewEvent = exports.ChatOpenEvent = exports.ButtonClickEvent = exports.CustomDomainVerificationResponse = exports.CustomDomainVerification = exports.CustomDomainCheck = exports.CustomDomain = exports.ChatButton = exports.VideoTriggerBlock = exports.VideoBlock = exports.TypographyBlock = exports.TypographyBlockSettings = exports.TextResponseBlock = exports.StepBlock = exports.SpacerBlock = exports.SignUpBlock = exports.RadioQuestionBlock = exports.RadioOptionBlock = exports.ImageBlock = exports.IconBlock = exports.GridItemBlock = exports.GridContainerBlock = exports.CardBlock = exports.ButtonBlock = exports.ButtonBlockSettings = exports.IQuery = exports.Journey = exports.IMutation = exports.EmailAction = exports.LinkAction = exports.NavigateToBlockAction = exports.VisitorUpdateInput = exports.UserTeamInviteCreateInput = exports.UserTeamFilterInput = exports.UserTeamUpdateInput = exports.UserInviteCreateInput = exports.TeamUpdateInput = exports.TeamCreateInput = exports.QrCodeUpdateInput = exports.QrCodeCreateInput = exports.QrCodesFilter = exports.PlausibleStatsTimeseriesFilter = exports.PlausibleStatsBreakdownFilter = exports.PlausibleStatsAggregateFilter = exports.JourneysEmailPreferenceUpdateInput = exports.JourneyVisitorFilter = void 0;
exports.ISchema = exports.User = exports.ShortLink = exports.Tag = exports.Language = exports.Video = exports.Translation = exports.VisitorsConnection = exports.PageInfo = exports.VisitorEdge = exports.Visitor = exports.UserAgent = exports.OperatingSystem = exports.Device = exports.Browser = exports.UserTeamInvite = exports.UserRole = exports.UserInvite = exports.Team = exports.QrCode = exports.PlausibleStatsResponse = exports.PlausibleStatsAggregateResponse = exports.PlausibleStatsAggregateValue = exports.JourneysEmailPreference = exports.JourneyVisitorsConnection = exports.JourneyVisitorEdge = exports.JourneyVisitor = exports.JourneyTheme = exports.JourneyProfile = exports.UserTeam = exports.JourneyNotification = exports.JourneyEventsConnection = exports.JourneyEventEdge = exports.JourneyEvent = exports.JourneyCustomizationField = exports.JourneyCollection = exports.UserJourney = exports.PowerBiEmbed = exports.IntegrationGrowthSpacesRoute = exports.IntegrationGrowthSpaces = exports.Host = exports.VideoProgressEvent = exports.VideoCollapseEvent = exports.VideoExpandEvent = exports.VideoCompleteEvent = exports.VideoPauseEvent = exports.VideoPlayEvent = exports.VideoStartEvent = exports.TextResponseSubmissionEvent = exports.StepPreviousEvent = void 0;
/* tslint:disable */
/* eslint-disable */
var ThemeMode;
(function (ThemeMode) {
    ThemeMode["dark"] = "dark";
    ThemeMode["light"] = "light";
})(ThemeMode || (exports.ThemeMode = ThemeMode = {}));
var ThemeName;
(function (ThemeName) {
    ThemeName["base"] = "base";
})(ThemeName || (exports.ThemeName = ThemeName = {}));
var ButtonVariant;
(function (ButtonVariant) {
    ButtonVariant["text"] = "text";
    ButtonVariant["contained"] = "contained";
    ButtonVariant["outlined"] = "outlined";
})(ButtonVariant || (exports.ButtonVariant = ButtonVariant = {}));
var ButtonColor;
(function (ButtonColor) {
    ButtonColor["primary"] = "primary";
    ButtonColor["secondary"] = "secondary";
    ButtonColor["error"] = "error";
    ButtonColor["inherit"] = "inherit";
})(ButtonColor || (exports.ButtonColor = ButtonColor = {}));
var ButtonSize;
(function (ButtonSize) {
    ButtonSize["small"] = "small";
    ButtonSize["medium"] = "medium";
    ButtonSize["large"] = "large";
})(ButtonSize || (exports.ButtonSize = ButtonSize = {}));
var ButtonAlignment;
(function (ButtonAlignment) {
    ButtonAlignment["left"] = "left";
    ButtonAlignment["center"] = "center";
    ButtonAlignment["right"] = "right";
    ButtonAlignment["justify"] = "justify";
})(ButtonAlignment || (exports.ButtonAlignment = ButtonAlignment = {}));
var GridDirection;
(function (GridDirection) {
    GridDirection["columnReverse"] = "columnReverse";
    GridDirection["column"] = "column";
    GridDirection["row"] = "row";
    GridDirection["rowReverse"] = "rowReverse";
})(GridDirection || (exports.GridDirection = GridDirection = {}));
var GridJustifyContent;
(function (GridJustifyContent) {
    GridJustifyContent["flexStart"] = "flexStart";
    GridJustifyContent["flexEnd"] = "flexEnd";
    GridJustifyContent["center"] = "center";
})(GridJustifyContent || (exports.GridJustifyContent = GridJustifyContent = {}));
var GridAlignItems;
(function (GridAlignItems) {
    GridAlignItems["baseline"] = "baseline";
    GridAlignItems["flexStart"] = "flexStart";
    GridAlignItems["flexEnd"] = "flexEnd";
    GridAlignItems["center"] = "center";
})(GridAlignItems || (exports.GridAlignItems = GridAlignItems = {}));
var IconName;
(function (IconName) {
    IconName["PlayArrowRounded"] = "PlayArrowRounded";
    IconName["TranslateRounded"] = "TranslateRounded";
    IconName["CheckCircleRounded"] = "CheckCircleRounded";
    IconName["RadioButtonUncheckedRounded"] = "RadioButtonUncheckedRounded";
    IconName["FormatQuoteRounded"] = "FormatQuoteRounded";
    IconName["LockOpenRounded"] = "LockOpenRounded";
    IconName["ArrowForwardRounded"] = "ArrowForwardRounded";
    IconName["ArrowBackRounded"] = "ArrowBackRounded";
    IconName["ChatBubbleOutlineRounded"] = "ChatBubbleOutlineRounded";
    IconName["LiveTvRounded"] = "LiveTvRounded";
    IconName["MenuBookRounded"] = "MenuBookRounded";
    IconName["ChevronRightRounded"] = "ChevronRightRounded";
    IconName["ChevronLeftRounded"] = "ChevronLeftRounded";
    IconName["BeenhereRounded"] = "BeenhereRounded";
    IconName["SendRounded"] = "SendRounded";
    IconName["SubscriptionsRounded"] = "SubscriptionsRounded";
    IconName["ContactSupportRounded"] = "ContactSupportRounded";
    IconName["Launch"] = "Launch";
    IconName["MailOutline"] = "MailOutline";
})(IconName || (exports.IconName = IconName = {}));
var IconColor;
(function (IconColor) {
    IconColor["primary"] = "primary";
    IconColor["secondary"] = "secondary";
    IconColor["action"] = "action";
    IconColor["error"] = "error";
    IconColor["disabled"] = "disabled";
    IconColor["inherit"] = "inherit";
})(IconColor || (exports.IconColor = IconColor = {}));
var IconSize;
(function (IconSize) {
    IconSize["sm"] = "sm";
    IconSize["md"] = "md";
    IconSize["lg"] = "lg";
    IconSize["xl"] = "xl";
    IconSize["inherit"] = "inherit";
})(IconSize || (exports.IconSize = IconSize = {}));
var TextResponseType;
(function (TextResponseType) {
    TextResponseType["freeForm"] = "freeForm";
    TextResponseType["name"] = "name";
    TextResponseType["email"] = "email";
    TextResponseType["phone"] = "phone";
})(TextResponseType || (exports.TextResponseType = TextResponseType = {}));
var TypographyVariant;
(function (TypographyVariant) {
    TypographyVariant["h1"] = "h1";
    TypographyVariant["h2"] = "h2";
    TypographyVariant["h3"] = "h3";
    TypographyVariant["h4"] = "h4";
    TypographyVariant["h5"] = "h5";
    TypographyVariant["h6"] = "h6";
    TypographyVariant["subtitle1"] = "subtitle1";
    TypographyVariant["subtitle2"] = "subtitle2";
    TypographyVariant["body1"] = "body1";
    TypographyVariant["body2"] = "body2";
    TypographyVariant["caption"] = "caption";
    TypographyVariant["overline"] = "overline";
})(TypographyVariant || (exports.TypographyVariant = TypographyVariant = {}));
var TypographyColor;
(function (TypographyColor) {
    TypographyColor["primary"] = "primary";
    TypographyColor["secondary"] = "secondary";
    TypographyColor["error"] = "error";
})(TypographyColor || (exports.TypographyColor = TypographyColor = {}));
var TypographyAlign;
(function (TypographyAlign) {
    TypographyAlign["left"] = "left";
    TypographyAlign["center"] = "center";
    TypographyAlign["right"] = "right";
})(TypographyAlign || (exports.TypographyAlign = TypographyAlign = {}));
var VideoBlockSource;
(function (VideoBlockSource) {
    VideoBlockSource["internal"] = "internal";
    VideoBlockSource["youTube"] = "youTube";
    VideoBlockSource["cloudflare"] = "cloudflare";
    VideoBlockSource["mux"] = "mux";
})(VideoBlockSource || (exports.VideoBlockSource = VideoBlockSource = {}));
var VideoBlockObjectFit;
(function (VideoBlockObjectFit) {
    VideoBlockObjectFit["fill"] = "fill";
    VideoBlockObjectFit["fit"] = "fit";
    VideoBlockObjectFit["zoomed"] = "zoomed";
})(VideoBlockObjectFit || (exports.VideoBlockObjectFit = VideoBlockObjectFit = {}));
var ButtonAction;
(function (ButtonAction) {
    ButtonAction["NavigateToBlockAction"] = "NavigateToBlockAction";
    ButtonAction["LinkAction"] = "LinkAction";
    ButtonAction["EmailAction"] = "EmailAction";
})(ButtonAction || (exports.ButtonAction = ButtonAction = {}));
var MessagePlatform;
(function (MessagePlatform) {
    MessagePlatform["facebook"] = "facebook";
    MessagePlatform["telegram"] = "telegram";
    MessagePlatform["whatsApp"] = "whatsApp";
    MessagePlatform["instagram"] = "instagram";
    MessagePlatform["kakaoTalk"] = "kakaoTalk";
    MessagePlatform["viber"] = "viber";
    MessagePlatform["vk"] = "vk";
    MessagePlatform["snapchat"] = "snapchat";
    MessagePlatform["skype"] = "skype";
    MessagePlatform["line"] = "line";
    MessagePlatform["tikTok"] = "tikTok";
    MessagePlatform["custom"] = "custom";
    MessagePlatform["globe2"] = "globe2";
    MessagePlatform["globe3"] = "globe3";
    MessagePlatform["messageText1"] = "messageText1";
    MessagePlatform["messageText2"] = "messageText2";
    MessagePlatform["send1"] = "send1";
    MessagePlatform["send2"] = "send2";
    MessagePlatform["messageChat2"] = "messageChat2";
    MessagePlatform["messageCircle"] = "messageCircle";
    MessagePlatform["messageNotifyCircle"] = "messageNotifyCircle";
    MessagePlatform["messageNotifySquare"] = "messageNotifySquare";
    MessagePlatform["messageSquare"] = "messageSquare";
    MessagePlatform["mail1"] = "mail1";
    MessagePlatform["linkExternal"] = "linkExternal";
    MessagePlatform["home3"] = "home3";
    MessagePlatform["home4"] = "home4";
    MessagePlatform["helpCircleContained"] = "helpCircleContained";
    MessagePlatform["helpSquareContained"] = "helpSquareContained";
    MessagePlatform["shieldCheck"] = "shieldCheck";
    MessagePlatform["menu1"] = "menu1";
    MessagePlatform["checkBroken"] = "checkBroken";
    MessagePlatform["checkContained"] = "checkContained";
    MessagePlatform["settings"] = "settings";
})(MessagePlatform || (exports.MessagePlatform = MessagePlatform = {}));
var IntegrationType;
(function (IntegrationType) {
    IntegrationType["growthSpaces"] = "growthSpaces";
})(IntegrationType || (exports.IntegrationType = IntegrationType = {}));
var JourneyMenuButtonIcon;
(function (JourneyMenuButtonIcon) {
    JourneyMenuButtonIcon["menu1"] = "menu1";
    JourneyMenuButtonIcon["equals"] = "equals";
    JourneyMenuButtonIcon["home3"] = "home3";
    JourneyMenuButtonIcon["home4"] = "home4";
    JourneyMenuButtonIcon["more"] = "more";
    JourneyMenuButtonIcon["ellipsis"] = "ellipsis";
    JourneyMenuButtonIcon["grid1"] = "grid1";
    JourneyMenuButtonIcon["chevronDown"] = "chevronDown";
})(JourneyMenuButtonIcon || (exports.JourneyMenuButtonIcon = JourneyMenuButtonIcon = {}));
var IdType;
(function (IdType) {
    IdType["databaseId"] = "databaseId";
    IdType["slug"] = "slug";
})(IdType || (exports.IdType = IdType = {}));
var JourneyStatus;
(function (JourneyStatus) {
    JourneyStatus["archived"] = "archived";
    JourneyStatus["deleted"] = "deleted";
    JourneyStatus["draft"] = "draft";
    JourneyStatus["published"] = "published";
    JourneyStatus["trashed"] = "trashed";
})(JourneyStatus || (exports.JourneyStatus = JourneyStatus = {}));
var JourneysReportType;
(function (JourneysReportType) {
    JourneysReportType["multipleFull"] = "multipleFull";
    JourneysReportType["multipleSummary"] = "multipleSummary";
    JourneysReportType["singleFull"] = "singleFull";
    JourneysReportType["singleSummary"] = "singleSummary";
})(JourneysReportType || (exports.JourneysReportType = JourneysReportType = {}));
var JourneyVisitorSort;
(function (JourneyVisitorSort) {
    JourneyVisitorSort["date"] = "date";
    JourneyVisitorSort["duration"] = "duration";
    JourneyVisitorSort["activity"] = "activity";
})(JourneyVisitorSort || (exports.JourneyVisitorSort = JourneyVisitorSort = {}));
var UserJourneyRole;
(function (UserJourneyRole) {
    UserJourneyRole["inviteRequested"] = "inviteRequested";
    UserJourneyRole["editor"] = "editor";
    UserJourneyRole["owner"] = "owner";
})(UserJourneyRole || (exports.UserJourneyRole = UserJourneyRole = {}));
var Role;
(function (Role) {
    Role["publisher"] = "publisher";
})(Role || (exports.Role = Role = {}));
var UserTeamRole;
(function (UserTeamRole) {
    UserTeamRole["manager"] = "manager";
    UserTeamRole["member"] = "member";
})(UserTeamRole || (exports.UserTeamRole = UserTeamRole = {}));
var DeviceType;
(function (DeviceType) {
    DeviceType["console"] = "console";
    DeviceType["mobile"] = "mobile";
    DeviceType["tablet"] = "tablet";
    DeviceType["smarttv"] = "smarttv";
    DeviceType["wearable"] = "wearable";
    DeviceType["embedded"] = "embedded";
})(DeviceType || (exports.DeviceType = DeviceType = {}));
var VisitorStatus;
(function (VisitorStatus) {
    VisitorStatus["star"] = "star";
    VisitorStatus["prohibited"] = "prohibited";
    VisitorStatus["checkMarkSymbol"] = "checkMarkSymbol";
    VisitorStatus["thumbsUp"] = "thumbsUp";
    VisitorStatus["thumbsDown"] = "thumbsDown";
    VisitorStatus["partyPopper"] = "partyPopper";
    VisitorStatus["warning"] = "warning";
    VisitorStatus["robotFace"] = "robotFace";
    VisitorStatus["redExclamationMark"] = "redExclamationMark";
    VisitorStatus["redQuestionMark"] = "redQuestionMark";
})(VisitorStatus || (exports.VisitorStatus = VisitorStatus = {}));
class NavigateToBlockActionInput {
}
exports.NavigateToBlockActionInput = NavigateToBlockActionInput;
class LinkActionInput {
}
exports.LinkActionInput = LinkActionInput;
class EmailActionInput {
}
exports.EmailActionInput = EmailActionInput;
class BlockUpdateActionInput {
}
exports.BlockUpdateActionInput = BlockUpdateActionInput;
class BlocksFilter {
}
exports.BlocksFilter = BlocksFilter;
class BlockDuplicateIdMap {
}
exports.BlockDuplicateIdMap = BlockDuplicateIdMap;
class ButtonBlockSettingsInput {
}
exports.ButtonBlockSettingsInput = ButtonBlockSettingsInput;
class ButtonBlockCreateInput {
}
exports.ButtonBlockCreateInput = ButtonBlockCreateInput;
class ButtonBlockUpdateInput {
}
exports.ButtonBlockUpdateInput = ButtonBlockUpdateInput;
class CardBlockCreateInput {
}
exports.CardBlockCreateInput = CardBlockCreateInput;
class CardBlockUpdateInput {
}
exports.CardBlockUpdateInput = CardBlockUpdateInput;
class IconBlockCreateInput {
}
exports.IconBlockCreateInput = IconBlockCreateInput;
class IconBlockUpdateInput {
}
exports.IconBlockUpdateInput = IconBlockUpdateInput;
class ImageBlockCreateInput {
}
exports.ImageBlockCreateInput = ImageBlockCreateInput;
class ImageBlockUpdateInput {
}
exports.ImageBlockUpdateInput = ImageBlockUpdateInput;
class RadioOptionBlockCreateInput {
}
exports.RadioOptionBlockCreateInput = RadioOptionBlockCreateInput;
class RadioOptionBlockUpdateInput {
}
exports.RadioOptionBlockUpdateInput = RadioOptionBlockUpdateInput;
class RadioQuestionBlockCreateInput {
}
exports.RadioQuestionBlockCreateInput = RadioQuestionBlockCreateInput;
class SignUpBlockCreateInput {
}
exports.SignUpBlockCreateInput = SignUpBlockCreateInput;
class SignUpBlockUpdateInput {
}
exports.SignUpBlockUpdateInput = SignUpBlockUpdateInput;
class SpacerBlockCreateInput {
}
exports.SpacerBlockCreateInput = SpacerBlockCreateInput;
class SpacerBlockUpdateInput {
}
exports.SpacerBlockUpdateInput = SpacerBlockUpdateInput;
class StepBlockCreateInput {
}
exports.StepBlockCreateInput = StepBlockCreateInput;
class StepBlockUpdateInput {
}
exports.StepBlockUpdateInput = StepBlockUpdateInput;
class StepBlockPositionUpdateInput {
}
exports.StepBlockPositionUpdateInput = StepBlockPositionUpdateInput;
class TextResponseBlockCreateInput {
}
exports.TextResponseBlockCreateInput = TextResponseBlockCreateInput;
class TextResponseBlockUpdateInput {
}
exports.TextResponseBlockUpdateInput = TextResponseBlockUpdateInput;
class TypographyBlockSettingsInput {
}
exports.TypographyBlockSettingsInput = TypographyBlockSettingsInput;
class TypographyBlockCreateInput {
}
exports.TypographyBlockCreateInput = TypographyBlockCreateInput;
class TypographyBlockUpdateInput {
}
exports.TypographyBlockUpdateInput = TypographyBlockUpdateInput;
class VideoBlockCreateInput {
}
exports.VideoBlockCreateInput = VideoBlockCreateInput;
class VideoBlockUpdateInput {
}
exports.VideoBlockUpdateInput = VideoBlockUpdateInput;
class ChatButtonCreateInput {
}
exports.ChatButtonCreateInput = ChatButtonCreateInput;
class ChatButtonUpdateInput {
}
exports.ChatButtonUpdateInput = ChatButtonUpdateInput;
class CustomDomainCreateInput {
}
exports.CustomDomainCreateInput = CustomDomainCreateInput;
class CustomDomainUpdateInput {
}
exports.CustomDomainUpdateInput = CustomDomainUpdateInput;
class ButtonClickEventCreateInput {
}
exports.ButtonClickEventCreateInput = ButtonClickEventCreateInput;
class ChatOpenEventCreateInput {
}
exports.ChatOpenEventCreateInput = ChatOpenEventCreateInput;
class JourneyViewEventCreateInput {
}
exports.JourneyViewEventCreateInput = JourneyViewEventCreateInput;
class RadioQuestionSubmissionEventCreateInput {
}
exports.RadioQuestionSubmissionEventCreateInput = RadioQuestionSubmissionEventCreateInput;
class SignUpSubmissionEventCreateInput {
}
exports.SignUpSubmissionEventCreateInput = SignUpSubmissionEventCreateInput;
class StepViewEventCreateInput {
}
exports.StepViewEventCreateInput = StepViewEventCreateInput;
class StepNextEventCreateInput {
}
exports.StepNextEventCreateInput = StepNextEventCreateInput;
class StepPreviousEventCreateInput {
}
exports.StepPreviousEventCreateInput = StepPreviousEventCreateInput;
class TextResponseSubmissionEventCreateInput {
}
exports.TextResponseSubmissionEventCreateInput = TextResponseSubmissionEventCreateInput;
class VideoStartEventCreateInput {
}
exports.VideoStartEventCreateInput = VideoStartEventCreateInput;
class VideoPlayEventCreateInput {
}
exports.VideoPlayEventCreateInput = VideoPlayEventCreateInput;
class VideoPauseEventCreateInput {
}
exports.VideoPauseEventCreateInput = VideoPauseEventCreateInput;
class VideoCompleteEventCreateInput {
}
exports.VideoCompleteEventCreateInput = VideoCompleteEventCreateInput;
class VideoExpandEventCreateInput {
}
exports.VideoExpandEventCreateInput = VideoExpandEventCreateInput;
class VideoCollapseEventCreateInput {
}
exports.VideoCollapseEventCreateInput = VideoCollapseEventCreateInput;
class VideoProgressEventCreateInput {
}
exports.VideoProgressEventCreateInput = VideoProgressEventCreateInput;
class HostUpdateInput {
}
exports.HostUpdateInput = HostUpdateInput;
class HostCreateInput {
}
exports.HostCreateInput = HostCreateInput;
class IntegrationGrowthSpacesCreateInput {
}
exports.IntegrationGrowthSpacesCreateInput = IntegrationGrowthSpacesCreateInput;
class IntegrationGrowthSpacesUpdateInput {
}
exports.IntegrationGrowthSpacesUpdateInput = IntegrationGrowthSpacesUpdateInput;
class JourneysFilter {
}
exports.JourneysFilter = JourneysFilter;
class JourneysQueryOptions {
}
exports.JourneysQueryOptions = JourneysQueryOptions;
class JourneyCreateInput {
}
exports.JourneyCreateInput = JourneyCreateInput;
class JourneyUpdateInput {
}
exports.JourneyUpdateInput = JourneyUpdateInput;
class JourneyTemplateInput {
}
exports.JourneyTemplateInput = JourneyTemplateInput;
class JourneyCollectionCreateInput {
}
exports.JourneyCollectionCreateInput = JourneyCollectionCreateInput;
class JourneyCollectionUpdateInput {
}
exports.JourneyCollectionUpdateInput = JourneyCollectionUpdateInput;
class JourneyCustomizationFieldInput {
}
exports.JourneyCustomizationFieldInput = JourneyCustomizationFieldInput;
class JourneyEventsFilter {
}
exports.JourneyEventsFilter = JourneyEventsFilter;
class JourneyNotificationUpdateInput {
}
exports.JourneyNotificationUpdateInput = JourneyNotificationUpdateInput;
class JourneyProfileUpdateInput {
}
exports.JourneyProfileUpdateInput = JourneyProfileUpdateInput;
class JourneyThemeCreateInput {
}
exports.JourneyThemeCreateInput = JourneyThemeCreateInput;
class JourneyThemeUpdateInput {
}
exports.JourneyThemeUpdateInput = JourneyThemeUpdateInput;
class JourneyVisitorFilter {
}
exports.JourneyVisitorFilter = JourneyVisitorFilter;
class JourneysEmailPreferenceUpdateInput {
}
exports.JourneysEmailPreferenceUpdateInput = JourneysEmailPreferenceUpdateInput;
class PlausibleStatsAggregateFilter {
}
exports.PlausibleStatsAggregateFilter = PlausibleStatsAggregateFilter;
class PlausibleStatsBreakdownFilter {
}
exports.PlausibleStatsBreakdownFilter = PlausibleStatsBreakdownFilter;
class PlausibleStatsTimeseriesFilter {
}
exports.PlausibleStatsTimeseriesFilter = PlausibleStatsTimeseriesFilter;
class QrCodesFilter {
}
exports.QrCodesFilter = QrCodesFilter;
class QrCodeCreateInput {
}
exports.QrCodeCreateInput = QrCodeCreateInput;
class QrCodeUpdateInput {
}
exports.QrCodeUpdateInput = QrCodeUpdateInput;
class TeamCreateInput {
}
exports.TeamCreateInput = TeamCreateInput;
class TeamUpdateInput {
}
exports.TeamUpdateInput = TeamUpdateInput;
class UserInviteCreateInput {
}
exports.UserInviteCreateInput = UserInviteCreateInput;
class UserTeamUpdateInput {
}
exports.UserTeamUpdateInput = UserTeamUpdateInput;
class UserTeamFilterInput {
}
exports.UserTeamFilterInput = UserTeamFilterInput;
class UserTeamInviteCreateInput {
}
exports.UserTeamInviteCreateInput = UserTeamInviteCreateInput;
class VisitorUpdateInput {
}
exports.VisitorUpdateInput = VisitorUpdateInput;
class NavigateToBlockAction {
}
exports.NavigateToBlockAction = NavigateToBlockAction;
class LinkAction {
}
exports.LinkAction = LinkAction;
class EmailAction {
}
exports.EmailAction = EmailAction;
class IMutation {
}
exports.IMutation = IMutation;
class Journey {
}
exports.Journey = Journey;
class IQuery {
}
exports.IQuery = IQuery;
class ButtonBlockSettings {
}
exports.ButtonBlockSettings = ButtonBlockSettings;
class ButtonBlock {
}
exports.ButtonBlock = ButtonBlock;
class CardBlock {
}
exports.CardBlock = CardBlock;
class GridContainerBlock {
}
exports.GridContainerBlock = GridContainerBlock;
class GridItemBlock {
}
exports.GridItemBlock = GridItemBlock;
class IconBlock {
}
exports.IconBlock = IconBlock;
class ImageBlock {
}
exports.ImageBlock = ImageBlock;
class RadioOptionBlock {
}
exports.RadioOptionBlock = RadioOptionBlock;
class RadioQuestionBlock {
}
exports.RadioQuestionBlock = RadioQuestionBlock;
class SignUpBlock {
}
exports.SignUpBlock = SignUpBlock;
class SpacerBlock {
}
exports.SpacerBlock = SpacerBlock;
class StepBlock {
}
exports.StepBlock = StepBlock;
class TextResponseBlock {
}
exports.TextResponseBlock = TextResponseBlock;
class TypographyBlockSettings {
}
exports.TypographyBlockSettings = TypographyBlockSettings;
class TypographyBlock {
}
exports.TypographyBlock = TypographyBlock;
class VideoBlock {
}
exports.VideoBlock = VideoBlock;
class VideoTriggerBlock {
}
exports.VideoTriggerBlock = VideoTriggerBlock;
class ChatButton {
}
exports.ChatButton = ChatButton;
class CustomDomain {
}
exports.CustomDomain = CustomDomain;
class CustomDomainCheck {
}
exports.CustomDomainCheck = CustomDomainCheck;
class CustomDomainVerification {
}
exports.CustomDomainVerification = CustomDomainVerification;
class CustomDomainVerificationResponse {
}
exports.CustomDomainVerificationResponse = CustomDomainVerificationResponse;
class ButtonClickEvent {
}
exports.ButtonClickEvent = ButtonClickEvent;
class ChatOpenEvent {
}
exports.ChatOpenEvent = ChatOpenEvent;
class JourneyViewEvent {
}
exports.JourneyViewEvent = JourneyViewEvent;
class RadioQuestionSubmissionEvent {
}
exports.RadioQuestionSubmissionEvent = RadioQuestionSubmissionEvent;
class SignUpSubmissionEvent {
}
exports.SignUpSubmissionEvent = SignUpSubmissionEvent;
class StepViewEvent {
}
exports.StepViewEvent = StepViewEvent;
class StepNextEvent {
}
exports.StepNextEvent = StepNextEvent;
class StepPreviousEvent {
}
exports.StepPreviousEvent = StepPreviousEvent;
class TextResponseSubmissionEvent {
}
exports.TextResponseSubmissionEvent = TextResponseSubmissionEvent;
class VideoStartEvent {
}
exports.VideoStartEvent = VideoStartEvent;
class VideoPlayEvent {
}
exports.VideoPlayEvent = VideoPlayEvent;
class VideoPauseEvent {
}
exports.VideoPauseEvent = VideoPauseEvent;
class VideoCompleteEvent {
}
exports.VideoCompleteEvent = VideoCompleteEvent;
class VideoExpandEvent {
}
exports.VideoExpandEvent = VideoExpandEvent;
class VideoCollapseEvent {
}
exports.VideoCollapseEvent = VideoCollapseEvent;
class VideoProgressEvent {
}
exports.VideoProgressEvent = VideoProgressEvent;
class Host {
}
exports.Host = Host;
class IntegrationGrowthSpaces {
}
exports.IntegrationGrowthSpaces = IntegrationGrowthSpaces;
class IntegrationGrowthSpacesRoute {
}
exports.IntegrationGrowthSpacesRoute = IntegrationGrowthSpacesRoute;
class PowerBiEmbed {
}
exports.PowerBiEmbed = PowerBiEmbed;
class UserJourney {
}
exports.UserJourney = UserJourney;
class JourneyCollection {
}
exports.JourneyCollection = JourneyCollection;
class JourneyCustomizationField {
}
exports.JourneyCustomizationField = JourneyCustomizationField;
class JourneyEvent {
}
exports.JourneyEvent = JourneyEvent;
class JourneyEventEdge {
}
exports.JourneyEventEdge = JourneyEventEdge;
class JourneyEventsConnection {
}
exports.JourneyEventsConnection = JourneyEventsConnection;
class JourneyNotification {
}
exports.JourneyNotification = JourneyNotification;
class UserTeam {
}
exports.UserTeam = UserTeam;
class JourneyProfile {
}
exports.JourneyProfile = JourneyProfile;
class JourneyTheme {
}
exports.JourneyTheme = JourneyTheme;
class JourneyVisitor {
}
exports.JourneyVisitor = JourneyVisitor;
class JourneyVisitorEdge {
}
exports.JourneyVisitorEdge = JourneyVisitorEdge;
class JourneyVisitorsConnection {
}
exports.JourneyVisitorsConnection = JourneyVisitorsConnection;
class JourneysEmailPreference {
}
exports.JourneysEmailPreference = JourneysEmailPreference;
class PlausibleStatsAggregateValue {
}
exports.PlausibleStatsAggregateValue = PlausibleStatsAggregateValue;
class PlausibleStatsAggregateResponse {
}
exports.PlausibleStatsAggregateResponse = PlausibleStatsAggregateResponse;
class PlausibleStatsResponse {
}
exports.PlausibleStatsResponse = PlausibleStatsResponse;
class QrCode {
}
exports.QrCode = QrCode;
class Team {
}
exports.Team = Team;
class UserInvite {
}
exports.UserInvite = UserInvite;
class UserRole {
}
exports.UserRole = UserRole;
class UserTeamInvite {
}
exports.UserTeamInvite = UserTeamInvite;
class Browser {
}
exports.Browser = Browser;
class Device {
}
exports.Device = Device;
class OperatingSystem {
}
exports.OperatingSystem = OperatingSystem;
class UserAgent {
}
exports.UserAgent = UserAgent;
class Visitor {
}
exports.Visitor = Visitor;
class VisitorEdge {
}
exports.VisitorEdge = VisitorEdge;
class PageInfo {
}
exports.PageInfo = PageInfo;
class VisitorsConnection {
}
exports.VisitorsConnection = VisitorsConnection;
class Translation {
}
exports.Translation = Translation;
class Video {
}
exports.Video = Video;
class Language {
}
exports.Language = Language;
class Tag {
}
exports.Tag = Tag;
class ShortLink {
}
exports.ShortLink = ShortLink;
class User {
}
exports.User = User;
class ISchema {
}
exports.ISchema = ISchema;
//# sourceMappingURL=graphql.js.map