/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CardIntroDelete
// ====================================================

export interface CardIntroDelete_video_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardIntroDelete_video {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardIntroDelete_video_deletedBlocks[];
}

export interface CardIntroDelete_endIcon_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardIntroDelete_endIcon {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardIntroDelete_endIcon_deletedBlocks[];
}

export interface CardIntroDelete_startIcon_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardIntroDelete_startIcon {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardIntroDelete_startIcon_deletedBlocks[];
}

export interface CardIntroDelete_button_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardIntroDelete_button {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardIntroDelete_button_deletedBlocks[];
}

export interface CardIntroDelete_body_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardIntroDelete_body {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardIntroDelete_body_deletedBlocks[];
}

export interface CardIntroDelete_title_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardIntroDelete_title {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardIntroDelete_title_deletedBlocks[];
}

export interface CardIntroDelete_subtitle_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardIntroDelete_subtitle {
  __typename: "BlockDeleteResponse";
  deletedBlocks: CardIntroDelete_subtitle_deletedBlocks[];
}

export interface CardIntroDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  video: CardIntroDelete_video;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  endIcon: CardIntroDelete_endIcon;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  startIcon: CardIntroDelete_startIcon;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  button: CardIntroDelete_button;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  body: CardIntroDelete_body;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  title: CardIntroDelete_title;
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  subtitle: CardIntroDelete_subtitle;
}

export interface CardIntroDeleteVariables {
  subtitleId: string;
  titleId: string;
  bodyId: string;
  buttonId: string;
  startIconId: string;
  endIconId: string;
  videoId: string;
}
