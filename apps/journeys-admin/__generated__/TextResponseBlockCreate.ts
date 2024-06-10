/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TextResponseBlockCreateInput, IconBlockCreateInput, TextResponseBlockUpdateInput, IconName, IconSize, IconColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TextResponseBlockCreate
// ====================================================

export interface TextResponseBlockCreate_textResponseBlockCreate {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  hint: string | null;
  minRows: number | null;
}

export interface TextResponseBlockCreate_submitIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface TextResponseBlockCreate_textResponseBlockUpdate {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  hint: string | null;
  minRows: number | null;
}

export interface TextResponseBlockCreate {
  textResponseBlockCreate: TextResponseBlockCreate_textResponseBlockCreate;
  submitIcon: TextResponseBlockCreate_submitIcon;
  textResponseBlockUpdate: TextResponseBlockCreate_textResponseBlockUpdate | null;
}

export interface TextResponseBlockCreateVariables {
  input: TextResponseBlockCreateInput;
  iconBlockCreateInput: IconBlockCreateInput;
  id: string;
  journeyId: string;
  updateInput: TextResponseBlockUpdateInput;
}
