/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BatchFilter, BatchStatus, BatchTaskStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: Batches
// ====================================================

export interface Batches_batches_batchTasks {
  __typename: "BatchTask";
  type: string | null;
  status: BatchTaskStatus | null;
  progress: number | null;
  task: any | null;
  error: string | null;
}

export interface Batches_batches {
  __typename: "Batch";
  id: string;
  name: string;
  status: BatchStatus | null;
  progress: number | null;
  createdAt: any;
  batchTasks: (Batches_batches_batchTasks | null)[] | null;
}

export interface Batches {
  batches: (Batches_batches | null)[] | null;
}

export interface BatchesVariables {
  where?: BatchFilter | null;
}
