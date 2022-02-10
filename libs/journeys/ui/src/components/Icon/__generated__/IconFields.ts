/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IconName, IconSize, IconColor } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: IconFields
// ====================================================

export interface IconFields {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  name: IconName;
  size: IconSize | null;
  color: IconColor | null;
}
