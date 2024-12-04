import { useTranslations } from 'next-intl'
import { ReactElement, useEffect, useState } from 'react'
import { FixedSizeList } from 'react-window'

import { GetAdminVideoVariant } from '../../../../../../../libs/useAdminVideo'
import { Section } from '../Section'

import { CreateVariantDialog } from './CreateVariantDialog'
import { VariantCard } from './VariantCard'

const ITEM_SIZE = 80

export function Variants({
  variants
}: {
  variants?: GetAdminVideoVariant[]
}): ReactElement {
  const t = useTranslations()
  const [size, setSize] = useState<{
    height: number
    width: number
  }>({
    height: 0,
    width: 0
  })
  const [open, setOpen] = useState(false)

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

  function handleOpenCreateVariantDialog(): void {
    setOpen(!open)
  }

  console.log('variants', variants)

  return (
    <>
      {variants != null && (
        <Section
          boxProps={{
            sx: { p: 2, height: 'calc(100vh - 400px)' }
          }}
          title={t('Variants')}
          variant="outlined"
          action={{
            label: t('Create Variant'),
            onClick: handleOpenCreateVariantDialog
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
              <VariantCard variant={items[index]} style={style} />
            )}
          </FixedSizeList>
          <CreateVariantDialog
            open={open}
            handleClose={handleOpenCreateVariantDialog}
            // variant={variants[0].videoId}
          />
        </Section>
      )}
    </>
  )
}
