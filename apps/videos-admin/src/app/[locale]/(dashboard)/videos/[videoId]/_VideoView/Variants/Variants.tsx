import AddIcon from '@mui/icons-material/Add'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import { FixedSizeList } from 'react-window'

import { GetAdminVideoVariant } from '../../../../../../../libs/useAdminVideo'
import { GetAdminVideo_AdminVideo_VideoEditions as VideoEditions } from '../../../../../../../libs/useAdminVideo/useAdminVideo'
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

const AddAudioLanguageDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "AddAudioLanguageDialog" */
      './AddAudioLanguageDialog'
    ).then((mod) => mod.AddAudioLanguageDialog),
  { ssr: false }
)

const ITEM_SIZE = 75

export function Variants({
  variants,
  editions
}: {
  variants?: GetAdminVideoVariant[]
  editions?: VideoEditions
}): ReactElement {
  const t = useTranslations()
  const [selectedVariant, setSelectedVariant] =
    useState<GetAdminVideoVariant | null>(null)
  const [open, setOpen] = useState<boolean | null>(null)
  const [openAddDialog, setOpenAddDialog] = useState<boolean | null>(null)

  function handleCardClick(variant: GetAdminVideoVariant): void {
    setSelectedVariant(variant)
    setOpen(true)
  }

  function handleClose(): void {
    setOpen(null)
  }

  function handleAddClose(): void {
    setOpenAddDialog(false)
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
          action={{
            label: t('Add Audio Language'),
            startIcon: <AddIcon />,
            onClick: () => setOpenAddDialog(true)
          }}
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
      {open != null && selectedVariant != null && (
        <VariantDialog
          open={open}
          handleClose={handleClose}
          variant={selectedVariant}
          variantLanguagesMap={variantLanguagesMap}
        />
      )}
      {openAddDialog != null && (
        <AddAudioLanguageDialog
          open={openAddDialog}
          handleClose={handleAddClose}
          variantLanguagesMap={variantLanguagesMap}
          editions={editions}
        />
      )}
    </>
  )
}
