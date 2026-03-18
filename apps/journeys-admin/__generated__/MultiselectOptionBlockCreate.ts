/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MultiselectOptionBlockCreateInput, ButtonVariant, ButtonColor, ButtonSize, ContactActionType, ButtonAlignment, BlockEventLabel, ThemeMode, ThemeName, IconName, IconSize, IconColor, TextResponseType, TypographyAlign, TypographyColor, TypographyVariant, VideoBlockSource, VideoBlockObjectFit } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MultiselectOptionBlockCreate
// ====================================================

export interface MultiselectOptionBlockCreate_multiselectOptionBlockCreate {
  __typename: "MultiselectOptionBlock";
  id: string;
  label: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface MultiselectOptionBlockCreate {
  multiselectOptionBlockCreate: MultiselectOptionBlockCreate_multiselectOptionBlockCreate;
}

export interface MultiselectOptionBlockCreateVariables {
  input: MultiselectOptionBlockCreateInput;
}
