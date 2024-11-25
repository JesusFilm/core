import { useMutation, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Modal, { ModalProps } from '@mui/material/Modal'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'
import { Downloads } from '../Downloads'

const GET_VIDEO_ADMIN_LANGUAGES = graphql(`
  query GetLanguages {
    languages {
      id
      iso3
      bcp47
      name {
        value
        primary
      }
    }
  }
`)

export const VIDEO_VARIANT_UPDATE = graphql(`
  mutation VideoVariantUpdate($input: VideoVariantUpdateInput!) {
    videoVariantUpdate(input: $input) {
      id
      language {
        id
        name {
          value
        }
        slug
      }
    }
  }
`)

interface VariantModalProps extends Omit<ModalProps, 'children'> {
  variant?: GetAdminVideoVariant
}

export function VariantModal({
  variant,
  ...rest
}: VariantModalProps): ReactElement | null {
  const t = useTranslations()
  const [updateVariant] = useMutation(VIDEO_VARIANT_UPDATE)

  const { data, loading } = useQuery(GET_VIDEO_ADMIN_LANGUAGES)

  const handleLanguageChange = (language): void => {
    if (variant == null) return
    void updateVariant({
      variables: {
        input: {
          id: variant.id,
          languageId: language.id
        }
      }
    })
  }

  if (variant == null) return null

  return (
    <Modal {...rest}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          border: '2px solid red',
          borderColor: 'divider',
          borderRadius: 1,
          p: 4
        }}
      >
        <Typography variant="h2">{t('Variant')}</Typography>
        <FormControl>
          <FormLabel>{t('Slug')}</FormLabel>
          <TextField disabled defaultValue={variant.slug} />
        </FormControl>
        <LanguageAutocomplete
          onChange={handleLanguageChange}
          value={{
            id: variant.language.id,
            localName: variant.language.name[0].value,
            nativeName: ''
          }}
          languages={data?.languages}
          loading={loading}
        />
        <Downloads downloads={variant.downloads} />
      </Box>
    </Modal>
  )
}
