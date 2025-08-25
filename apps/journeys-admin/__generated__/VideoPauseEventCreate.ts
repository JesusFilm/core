/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoPauseEventCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VideoPauseEventCreate
// ====================================================

export interface VideoPauseEventCreate_videoPauseEventCreate {
  __typename: "VideoPauseEvent";
  id: string | null;
}

export interface VideoPauseEventCreate {
  videoPauseEventCreate: VideoPauseEventCreate_videoPauseEventCreate | null;
}

export interface VideoPauseEventCreateVariables {
  input: VideoPauseEventCreateInput;
}
