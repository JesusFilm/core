/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: JourneyAiTranslateStatus
// ====================================================

export interface JourneyAiTranslateStatus_journeyAiTranslateStatus {
  __typename: "JourneyAiTranslateStatus";
  id: string;
  status: string;
  progress: number;
}

export interface JourneyAiTranslateStatus {
  journeyAiTranslateStatus: JourneyAiTranslateStatus_journeyAiTranslateStatus | null;
}

export interface JourneyAiTranslateStatusVariables {
  jobId: string;
}
