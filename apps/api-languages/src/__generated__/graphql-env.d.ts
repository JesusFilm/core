/* eslint-disable */
/* prettier-ignore */

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to reuse this data or update your `scalars`, update `tadaOutputLocation` to
 * instead save to a .ts instead of a .d.ts file.
 */
export type introspection = {
  query: 'Query';
  mutation: never;
  subscription: never;
  types: {
    'Country': { kind: 'OBJECT'; name: 'Country'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'population': { name: 'population'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; 'latitude': { name: 'latitude'; type: { kind: 'SCALAR'; name: 'Float'; ofType: null; } }; 'longitude': { name: 'longitude'; type: { kind: 'SCALAR'; name: 'Float'; ofType: null; } }; 'flagPngSrc': { name: 'flagPngSrc'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'flagWebpSrc': { name: 'flagWebpSrc'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'languages': { name: 'languages'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; }; }; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Translation'; ofType: null; }; }; }; } }; 'continent': { name: 'continent'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Translation'; ofType: null; }; }; }; } }; }; };
    'ID': unknown;
    'Int': unknown;
    'Float': unknown;
    'String': unknown;
    'Boolean': unknown;
    'Language': { kind: 'OBJECT'; name: 'Language'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'bcp47': { name: 'bcp47'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'iso3': { name: 'iso3'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Translation'; ofType: null; }; }; }; } }; }; };
    'LanguageIdType': { kind: 'ENUM'; name: 'LanguageIdType'; type: 'databaseId' | 'bcp47'; };
    'LanguagesFilter': { kind: 'INPUT_OBJECT'; name: 'LanguagesFilter'; inputFields: [{ name: 'ids'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; }; }; defaultValue: null }]; };
    'Query': { kind: 'OBJECT'; name: 'Query'; fields: { 'language': { name: 'language'; type: { kind: 'OBJECT'; name: 'Language'; ofType: null; } }; 'languages': { name: 'languages'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; }; }; } }; 'country': { name: 'country'; type: { kind: 'OBJECT'; name: 'Country'; ofType: null; } }; 'countries': { name: 'countries'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Country'; ofType: null; }; }; }; } }; }; };
    'Translation': { kind: 'OBJECT'; name: 'Translation'; fields: { 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'primary': { name: 'primary'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; }; };
  };
};

import * as gqlTada from 'gql.tada';

declare module 'gql.tada' {
  interface setupSchema {
    introspection: introspection
  }
}