import { useQuery } from '@apollo/client'
import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import {
  Box,
  FormControl,
  Modal,
  ModalProps,
  Select,
  Stack,
  Typography
} from '@mui/material'
import { graphql } from 'gql.tada'
import { ReactElement, useState } from 'react'

import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { DraggableRow } from '../DraggableRow'

// const GET_VIDEO_LANGUAGES = graphql(`
//   query GetVariantLanguages a
//   `)

// function useGetLanguages({ variantId }) {
// const query = useQuery()
// }

interface VariantModalProps extends Omit<ModalProps, 'children'> {
  variant: any
}

function VariantModal({ variant, ...rest }: VariantModalProps): ReactElement {
  // const { data } = useGetLanguages({ variantId: variant.id })
  console.log({ variant })

  if (variant == null) return <Typography>No Variant</Typography>

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
        <pre>{JSON.stringify(variant, null, 2)}</pre>
        <LanguageAutocomplete
          onChange={() => alert('change language')}
          value="529"
          languages={variant.language}
          loading={false}
        />
      </Box>
    </Modal>
  )
}

export function Variants({ variants }): ReactElement {
  const [open, setOpen] = useState(false)
  const [variant, setVariant] = useState(null)
  const items = variants.slice(0, 50)

  const handleOpen = (variant): void => {
    setOpen(true)
    setVariant(variant)
  }
  const handleClose = (): void => setOpen(false)
  return (
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
      <VariantModal open={open} onClose={handleClose} variant={variant} />
    </Box>
  )
}
