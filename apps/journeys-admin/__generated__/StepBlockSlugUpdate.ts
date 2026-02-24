/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StepBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: StepBlockSlugUpdate
// ====================================================

export interface StepBlockSlugUpdate_stepBlockUpdate {
  __typename: "StepBlock";
  id: string;
  /**
   * Slug should be unique amongst all blocks
   * (server will throw BAD_USER_INPUT error if not)
   * If not required will use the current block id
   * If the generated slug is not unique the uuid will be placed
   * at the end of the slug guaranteeing uniqueness
   */
  slug: string | null;
}

export interface StepBlockSlugUpdate {
  stepBlockUpdate: StepBlockSlugUpdate_stepBlockUpdate;
}

export interface StepBlockSlugUpdateVariables {
  id: string;
  input: StepBlockUpdateInput;
}
