/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace ResponseModule {
  interface DefinedFields {
    Response: 'id' | 'userId';
  };
  
  export type Response = Pick<Types.Response, DefinedFields['Response']>;
  
  export type ResponseResolvers = Pick<Types.ResponseResolvers, DefinedFields['Response']>;
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
  };
}