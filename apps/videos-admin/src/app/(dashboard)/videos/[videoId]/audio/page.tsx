import AddIcon from '@mui/icons-material/Add'
import dynamic from 'next/dynamic'
import { MouseEvent, ReactElement, useEffect, useMemo, useState } from 'react'
import { FixedSizeList } from 'react-window'

import { Section } from '../../../../../components/Section'
import { GetAdminVideoVariant } from '../../../../../libs/useAdminVideo'

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

const DeleteVariantDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "DeleteVariantDialog" */
      './DeleteVariantDialog'
    ).then((mod) => mod.DeleteVariantDialog),
  {
    ssr: false
  }
)

const ITEM_SIZE = 75

type VariantsParams = {
  params: {
    videoId: string
  }
}
export default function Variants({
  params: { videoId }
}: VariantsParams): ReactElement {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  )
  const [open, setOpen] = useState<boolean | null>(null)
  const [openAddDialog, setOpenAddDialog] = useState<boolean | null>(null)
  const [deleteVariant, setDeleteVariant] =
    useState<GetAdminVideoVariant | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean | null>(null)
  const [size, setSize] = useState<{
    height: number
    width: number
  }>({
    height: 0,
    width: 0
  })

  function handleCardClick(variant: GetAdminVideoVariant): void {
    setSelectedVariantId(variant.id)
    setOpen(true)
  }

  function handleClose(): void {
    setOpen(null)
  }

  function handleAddClose(): void {
    setOpenAddDialog(false)
  }

  function handleDeleteClick(
    variant: GetAdminVideoVariant,
    event: MouseEvent<HTMLButtonElement>
  ): void {
    event.stopPropagation()
    setDeleteVariant(variant)
    setOpenDeleteDialog(true)
  }

  function handleDeleteClose(): void {
    setOpenDeleteDialog(false)
  }

  function handleDeleteSuccess(): void {
    setDeleteVariant(null)
  }

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

  const selectedVariant = useMemo(() => {
    if (!variants || !selectedVariantId) return null
    return variants.find((variant) => variant.id === selectedVariantId) || null
  }, [variants, selectedVariantId])

  return (
    <>
      {variants != null && (
        <Section
          boxProps={{
            sx: { p: 2, height: 'calc(100vh - 400px)' }
          }}
          // if you change the title, change the element selected in the getVariantSectionDimensions function above
          title="Audio Languages"
          variant="outlined"
          action={{
            label: 'Add Audio Language',
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
            itemKey={(index, data) => data[index].id}
            overscanCount={10}
            style={{
              marginTop: 8
            }}
          >
            {({ index, style, data }) => (
              <VariantCard
                key={data[index].id}
                variant={data[index]}
                style={style}
                onClick={handleCardClick}
                onDelete={handleDeleteClick}
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
      {openDeleteDialog != null && deleteVariant != null && (
        <DeleteVariantDialog
          variant={deleteVariant}
          open={openDeleteDialog}
          onClose={handleDeleteClose}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  )
}
