/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IconBlockCreateInput, IconName, IconColor, IconSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: IconBlockCreate
// ====================================================

export interface IconBlockCreate_iconBlockCreate {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  journeyId: string;
  name: IconName;
  color: IconColor | null;
  size: IconSize | null;
}

export interface IconBlockCreate {
  iconBlockCreate: IconBlockCreate_iconBlockCreate;
}

export interface IconBlockCreateVariables {
  input: IconBlockCreateInput;
}
