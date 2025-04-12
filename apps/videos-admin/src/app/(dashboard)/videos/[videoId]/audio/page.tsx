'use client'

import dynamic from 'next/dynamic'
import { MouseEvent, ReactElement, useEffect, useMemo, useState } from 'react'

import { GetAdminVideoVariant } from '../../../../../libs/useAdminVideo'

import { VariantCard } from './_card'

const ITEM_SIZE = 75

const VariantDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "VariantDialog" */
      './[variantId]'
    ).then((mod) => mod.VariantDialog),
  { ssr: false }
)

const AddAudioLanguageDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "AddAudioLanguageDialog" */
      './add'
    ).then((mod) => mod.AddAudioLanguageDialog),
  { ssr: false }
)

const DeleteVariantDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "DeleteVariantDialog" */
      './_delete'
    ).then((mod) => mod.DeleteVariantDialog),
  {
    ssr: false
  }
)

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
          editions={data.videoEditions}
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
