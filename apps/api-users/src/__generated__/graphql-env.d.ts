/* eslint-disable */
/* prettier-ignore */

export type introspection_types = {
    'Boolean': unknown;
    'CreateVerificationRequestInput': { kind: 'INPUT_OBJECT'; name: 'CreateVerificationRequestInput'; isOneOf: false; inputFields: [{ name: 'redirect'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }]; };
    'ID': unknown;
    'MeInput': { kind: 'INPUT_OBJECT'; name: 'MeInput'; isOneOf: false; inputFields: [{ name: 'redirect'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }]; };
    'Mutation': { kind: 'OBJECT'; name: 'Mutation'; fields: { 'createVerificationRequest': { name: 'createVerificationRequest'; type: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; } }; 'userImpersonate': { name: 'userImpersonate'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'validateEmail': { name: 'validateEmail'; type: { kind: 'OBJECT'; name: 'User'; ofType: null; } }; }; };
    'Query': { kind: 'OBJECT'; name: 'Query'; fields: { 'me': { name: 'me'; type: { kind: 'OBJECT'; name: 'User'; ofType: null; } }; 'user': { name: 'user'; type: { kind: 'OBJECT'; name: 'User'; ofType: null; } }; 'userByEmail': { name: 'userByEmail'; type: { kind: 'OBJECT'; name: 'User'; ofType: null; } }; }; };
    'String': unknown;
    'User': { kind: 'OBJECT'; name: 'User'; fields: { 'email': { name: 'email'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'emailVerified': { name: 'emailVerified'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'firstName': { name: 'firstName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'imageUrl': { name: 'imageUrl'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'lastName': { name: 'lastName'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'superAdmin': { name: 'superAdmin'; type: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; } }; }; };
};

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to reuse this data or update your `scalars`, update `tadaOutputLocation` to
 * instead save to a .ts instead of a .d.ts file.
 */
export type introspection = {
  name: never;
  query: 'Query';
  mutation: 'Mutation';
  subscription: never;
  types: introspection_types;
};

import * as gqlTada from 'gql.tada';

declare module 'gql.tada' {
  interface setupSchema {
    introspection: introspection
  }
}