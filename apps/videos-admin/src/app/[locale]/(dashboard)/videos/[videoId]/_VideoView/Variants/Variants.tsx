import { ReactElement, useEffect, useMemo, useState } from 'react'

import { GetAdminVideoVariant } from '../../../../../../../libs/useAdminVideo'
import { Section } from '../Section'

import { VariantCard } from './VariantCard'
import { VariantModal } from './VariantModal'
import { FixedSizeList } from 'react-window'
import { useTranslations } from 'next-intl'

const ITEM_SIZE = 80

export function Variants({
  variants
}: {
  variants?: GetAdminVideoVariant[]
}): ReactElement {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [size, setSize] = useState<{
    height: number
    width: number
  }>({
    height: 0,
    width: 0
  })

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

  function getVariantSectionDimensions(): void {
    const section = document.getElementById('Variants-section')
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

  return (
    <>
      {variants != null && (
        <Section
          boxProps={{
            sx: { p: 0, height: 'calc(100vh - 400px)' }
          }}
          title={t('Variants')}
          action={{
            label: t('Create Variant'),
            onClick: () => alert('Create variant')
          }}
        >
          <FixedSizeList
            width={size.width}
            height={size.height}
            itemData={variants}
            itemCount={variants.length}
            itemSize={ITEM_SIZE}
            overscanCount={10}
          >
            {({ index, style, data: items }) => (
              <VariantCard
                key={index}
                variant={items[index]}
                onClick={() => handleOpen(items[index]?.id)}
                style={style}
              />
            )}
          </FixedSizeList>
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
