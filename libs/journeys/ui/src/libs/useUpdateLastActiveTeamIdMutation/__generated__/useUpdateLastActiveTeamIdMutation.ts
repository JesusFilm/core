import * as Types from '../../../../__generated__/globalTypes';

export type UpdateLastActiveTeamIdMutationVariables = Types.Exact<{
  input: Types.JourneyProfileUpdateInput;
}>;


export type UpdateLastActiveTeamIdMutation = { journeyProfileUpdate: { __typename: 'JourneyProfile', id: string } };
