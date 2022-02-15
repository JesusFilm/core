/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IconBlockCreateInput, IconName, IconSize, IconColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: IconBlockCreate
// ====================================================

export interface IconBlockCreate_iconBlockCreate {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface IconBlockCreate {
  iconBlockCreate: IconBlockCreate_iconBlockCreate;
}

export interface IconBlockCreateVariables {
  input: IconBlockCreateInput;
}
