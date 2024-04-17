/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IconName, IconSize, IconColor } from "./globalTypes";

// ====================================================
// GraphQL fragment: IconFields
// ====================================================

export interface IconFields {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}
