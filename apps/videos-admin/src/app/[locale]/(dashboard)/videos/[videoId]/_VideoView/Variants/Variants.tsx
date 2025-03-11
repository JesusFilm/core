import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import { FixedSizeList } from 'react-window'

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
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  )
  const [open, setOpen] = useState<boolean | null>(null)

  function handleCardClick(variant: GetAdminVideoVariant): void {
    setSelectedVariantId(variant.id)
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

  return (
    <>
      {variants != null && (
        <Section
          boxProps={{
            sx: { p: 2, height: 'calc(100vh - 400px)' }
          }}
          // if you change the title, change the element selected in the getVariantSectionDimensions function above
          title={t('Audio Languages')}
          variant="outlined"
        >
          <FixedSizeList
            width={size.width - 20}
            height={size.height - 90}
            itemData={variants}
            itemCount={variants.length}
            itemSize={ITEM_SIZE}
            overscanCount={10}
            style={{
              marginTop: 8
            }}
          >
            {({ index, style, data: items }) => (
              <VariantCard
                variant={items[index]}
                style={style}
                onClick={handleCardClick}
              />
            )}
          </FixedSizeList>
        </Section>
      )}
      {open != null && selectedVariantId != null && (
        <VariantDialog
          open={open}
          handleClose={handleClose}
          variantId={selectedVariantId}
          variantLanguagesMap={variantLanguagesMap}
        />
      )}
    </>
  )
}
