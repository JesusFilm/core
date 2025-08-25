/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CardIntroDelete
// ====================================================

export interface CardIntroDelete_video {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardIntroDelete_endIcon {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardIntroDelete_startIcon {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardIntroDelete_button {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardIntroDelete_body {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardIntroDelete_title {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardIntroDelete_subtitle {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
  id: string;
  parentOrder: number | null;
}

export interface CardIntroDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  video: CardIntroDelete_video[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  endIcon: CardIntroDelete_endIcon[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  startIcon: CardIntroDelete_startIcon[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  button: CardIntroDelete_button[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  body: CardIntroDelete_body[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  title: CardIntroDelete_title[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  subtitle: CardIntroDelete_subtitle[];
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
