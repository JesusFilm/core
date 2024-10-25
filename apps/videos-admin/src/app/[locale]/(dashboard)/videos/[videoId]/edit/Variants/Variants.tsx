import { useMutation, useQuery } from '@apollo/client'
import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import {
  Box,
  FormControl,
  FormLabel,
  Modal,
  ModalProps,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { useVideoVariant } from '../../../../../../../libs/useVideoVariant/useVideoVariant'
import { DraggableRow } from '../DraggableRow'
import { Section } from '../Section'

import { Downloads } from './Downloads'

const GET_LANGUAGES = graphql(`
  query GetLanguages {
    languages {
      id
      iso3
      bcp47
      name {
        value
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
  variant: any
}

function VariantModal({
  variant,
  ...rest
}: VariantModalProps): ReactElement | null {
  const t = useTranslations()
  const [updateVariant] = useMutation(VIDEO_VARIANT_UPDATE)
  // const { data } = useGetLanguages({ variantId: variant.id })
  console.log({ variant })

  const { data, loading } = useQuery(GET_LANGUAGES)

  console.log({ data })

  const handleLanguageChange = (language): void => {
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

export function Variants({ variants }): ReactElement {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const items = variants.slice(0, 50)

  console.log({ variants })

  const handleOpen = (variant): void => {
    setOpen(true)
    setSelected(variant.id)
  }
  const handleClose = (): void => setOpen(false)
  return (
    <Section
      title="Variants"
      action={{
        label: 'Create Variant',
        onClick: () => alert('Create variant')
      }}
    >
      <Box sx={{ height: '600px', overflowY: 'scroll' }}>
        <DndContext>
          <SortableContext items={items}>
            <Stack gap={1}>
              {items.map((variant, idx) => (
                <DraggableRow
                  key={variant.id}
                  id={variant.id}
                  label={variant.slug}
                  idx={idx}
                  count={items.length}
                  handleClick={() => {
                    handleOpen(variant)
                  }}
                />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
        <VariantModal
          open={open}
          onClose={handleClose}
          variant={variants.find((variant) => variant.id === selected)}
        />
      </Box>
    </Section>
  )
}
