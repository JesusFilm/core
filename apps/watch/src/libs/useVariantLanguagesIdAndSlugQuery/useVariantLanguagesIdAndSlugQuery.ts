import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import {
  GetVariantLanguagesIdAndSlug,
  GetVariantLanguagesIdAndSlugVariables
} from '../../../__generated__/GetVariantLanguagesIdAndSlug'

export const GET_VARIANT_LANGUAGES_ID_AND_SLUG = gql`
  query GetVariantLanguagesIdAndSlug($id: ID!) {
    video(id: $id, idType: databaseId) {
      variantLanguages {
        id
        slug
      }
      subtitles {
        languageId
      }
    }
  }
`

export function useVariantLanguagesIdAndSlugQuery(
  options?: useQuery.Options<
    GetVariantLanguagesIdAndSlug,
    GetVariantLanguagesIdAndSlugVariables
  >
): useQuery.Result<
  GetVariantLanguagesIdAndSlug,
  GetVariantLanguagesIdAndSlugVariables
> {
  const result = useQuery<
    GetVariantLanguagesIdAndSlug,
    GetVariantLanguagesIdAndSlugVariables
  >(GET_VARIANT_LANGUAGES_ID_AND_SLUG, options)

  return result
}
