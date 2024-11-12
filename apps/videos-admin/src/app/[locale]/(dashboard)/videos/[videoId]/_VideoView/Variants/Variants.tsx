import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement, useMemo, useState } from 'react'

import { GetAdminVideoVariant } from '../../../../../../../libs/useAdminVideo'
import { Section } from '../Section'

import { VariantCard } from './VariantCard'
import { VariantModal } from './VariantModal'

export function Variants({
  variants
}: {
  variants?: GetAdminVideoVariant[]
}): ReactElement {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const handleOpen = (variantId?: string): void => {
    setOpen(true)
    if (variantId != null) setSelected(variantId)
  }
  const handleClose = (): void => setOpen(false)
  const variantsMap = useMemo(() => {
    if (variants == null) return null
    return new Map(variants.map((variant) => [variant.id, variant]))
  }, [variants])

  return (
    <>
      {variants != null && (
        <Section
          boxProps={{
            sx: { p: 0, height: 'calc(100vh - 400px)' }
          }}
          title="Variants"
          action={{
            label: 'Create Variant',
            onClick: () => alert('Create variant')
          }}
        >
          <Box sx={{ p: 4, overflowY: 'scroll', height: '100%' }}>
            <Stack gap={1}>
              {variants?.map((variant, idx) => (
                <VariantCard
                  key={idx}
                  variant={variant}
                  onClick={() => handleOpen(variant?.id)}
                />
              ))}
            </Stack>
          </Box>
          {variantsMap != null && selected != null && (
            <VariantModal
              open={open}
              onClose={handleClose}
              variant={variantsMap.get(selected)}
            />
          )}
        </Section>
      )}
    </>
  )
}
