import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import { FixedSizeList, ListChildComponentProps } from 'react-window'

import { GetAdminVideoVariant } from '../../../../../../../libs/useAdminVideo'
import { Section } from '../Section'

import { VariantCard } from './VariantCard'

const VariantDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "VariantDialog" */
      './VariantDialog'
    ).then((mod) => mod.VariantDialog),
  { ssr: false }
)

const ITEM_SIZE = 75

export function Variants({
  variants
}: {
  variants?: GetAdminVideoVariant[]
}): ReactElement {
  const t = useTranslations()
  const [selectedVariant, setSelectedVariant] =
    useState<GetAdminVideoVariant | null>(null)
  const [open, setOpen] = useState<boolean | null>(null)

  function handleCardClick(variant: GetAdminVideoVariant): void {
    setSelectedVariant(variant)
    setOpen(true)
  }

  function handleClose(): void {
    setOpen(null)
  }

  const [size, setSize] = useState<{
    height: number
    width: number
  }>({
    height: 0,
    width: 0
  })

  function getVariantSectionDimensions(): void {
    const section = document.getElementById('Audio Languages-section')
    if (section == null) return
    const { width, height } = section.getBoundingClientRect()
    setSize({ width, height })
  }

  useEffect(() => {
    getVariantSectionDimensions()
    window.addEventListener('resize', getVariantSectionDimensions)
    return () => {
      window.removeEventListener('resize', getVariantSectionDimensions)
    }
  }, [])

  const variantLanguagesMap: Map<string, GetAdminVideoVariant> = useMemo(() => {
    return new Map(variants?.map((variant) => [variant.language.id, variant]))
  }, [variants])

  function renderRow(
    props: ListChildComponentProps<{
      variants: GetAdminVideoVariant[]
      onClick: (variant: GetAdminVideoVariant) => void
    }>
  ): ReactElement {
    const { data, index, style } = props
    const variant = data.variants[index]
    return (
      <VariantCard variant={variant} style={style} onClick={data.onClick} />
    )
  }

  return (
    <Section
      title={t('Audio Languages')}
      sx={{ height: '100%' }}
      variant="outlined"
    >
      <Stack spacing={2}>
        {/* Existing variants list */}
        <Box sx={{ height: size.height - ITEM_SIZE }}>
          <FixedSizeList
            height={size.height - ITEM_SIZE}
            width="100%"
            itemCount={variants?.length ?? 0}
            itemSize={ITEM_SIZE}
            itemData={{
              variants: variants ?? [],
              onClick: handleCardClick
            }}
          >
            {renderRow}
          </FixedSizeList>
        </Box>
      </Stack>

      {selectedVariant != null && (
        <VariantDialog
          variant={selectedVariant}
          open={open ?? false}
          handleClose={handleClose}
          variantLanguagesMap={variantLanguagesMap}
        />
      )}
    </Section>
  )
}
