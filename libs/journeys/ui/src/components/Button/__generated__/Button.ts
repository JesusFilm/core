import * as Types from '../../../../__generated__/globalTypes';

export type ButtonClickEventCreateMutationVariables = Types.Exact<{
  input: Types.ButtonClickEventCreateInput;
}>;


export type ButtonClickEventCreateMutation = { buttonClickEventCreate: { __typename: 'ButtonClickEvent', id: string } };

export type ChatOpenEventCreateMutationVariables = Types.Exact<{
  input: Types.ChatOpenEventCreateInput;
}>;


export type ChatOpenEventCreateMutation = { chatOpenEventCreate: { __typename: 'ChatOpenEvent', id: string } };
