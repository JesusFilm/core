/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ColumnSize, GridType } from "./globalTypes";

// ====================================================
// GraphQL fragment: GridFields
// ====================================================

export interface GridFields {
  __typename: "GridBlock";
  id: string;
  parentBlockId: string | null;
  md: ColumnSize | null;
  type: GridType | null;
}
