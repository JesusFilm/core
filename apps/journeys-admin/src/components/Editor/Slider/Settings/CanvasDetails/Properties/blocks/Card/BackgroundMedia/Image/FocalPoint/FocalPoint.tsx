import { gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../../../../../__generated__/globalTypes'

import { calculatePoint } from './utils/calculatePoint'
import { clampPosition } from './utils/clampPosition'

const IMAGE_FOCAL_POINT_FRAGMENT = gql`
  fragment ImageFocalPoint on ImageBlock {
    focalLeft
    focalTop
  }
`

export interface Position {
  x: number
  y: number
}

interface FocalPointProps {
  imageBlock?: ImageBlock | null
  updateImageBlock: (
    input: ImageBlockUpdateInput,
    shouldFocus?: boolean,
    undoBlock?: ImageBlock
  ) => void
}

export function FocalPoint({
  imageBlock,
  updateImageBlock
}: FocalPointProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const client = useApolloClient()

  const imageRef = useRef<HTMLDivElement>(null)
  // the block as it was when the drag started; null when not dragging
  const startBlockRef = useRef<ImageBlock | null>(null)
  // the pointer driving the drag; other pointers are ignored
  const pointerIdRef = useRef<number | null>(null)
  const previewFrameRef = useRef<number | null>(null)
  const [localPosition, setLocalPosition] = useState<Position>({
    x: imageBlock?.focalLeft ?? 50,
    y: imageBlock?.focalTop ?? 50
  })
  const positionRef = useRef(localPosition)

  useEffect(() => {
    // previews write to the block mid-drag; the dot already shows them
    if (startBlockRef.current?.id === imageBlock?.id) return
    // a different block was selected mid-drag, so drop the unsaved preview
    revert()

    const position = {
      x: imageBlock?.focalLeft ?? 50,
      y: imageBlock?.focalTop ?? 50
    }
    positionRef.current = position
    setLocalPosition(position)
  }, [imageBlock?.id, imageBlock?.focalLeft, imageBlock?.focalTop])

  // Writes to the cache only, so the canvas previews the point before it is
  // saved.
  function writeFocalPoint(blockId: string, position: Position): void {
    client.cache.writeFragment({
      id: client.cache.identify({ __typename: 'ImageBlock', id: blockId }),
      fragment: IMAGE_FOCAL_POINT_FRAGMENT,
      data: {
        focalLeft: Math.round(position.x),
        focalTop: Math.round(position.y)
      }
    })
  }

  function cancelPreviewFrame(): void {
    if (previewFrameRef.current != null)
      cancelAnimationFrame(previewFrameRef.current)
    previewFrameRef.current = null
  }

  // Each preview re-renders the whole editor, so previews are written at most
  // once per frame, always with the latest position.
  function setPosition(position: Position): void {
    positionRef.current = position
    setLocalPosition(position)
    if (previewFrameRef.current != null) return

    previewFrameRef.current = requestAnimationFrame(() => {
      previewFrameRef.current = null
      const startBlock = startBlockRef.current
      if (startBlock != null)
        writeFocalPoint(startBlock.id, positionRef.current)
    })
  }

  // saves the drag once, with the pre-drag block as the undo state
  function save(): void {
    const startBlock = startBlockRef.current
    cancelPreviewFrame()
    startBlockRef.current = null
    pointerIdRef.current = null
    if (startBlock == null) return

    writeFocalPoint(startBlock.id, positionRef.current)
    const focalLeft = Math.round(positionRef.current.x)
    const focalTop = Math.round(positionRef.current.y)
    if (focalLeft === startBlock.focalLeft && focalTop === startBlock.focalTop)
      return

    updateImageBlock(
      {
        src: startBlock.src,
        alt: startBlock.alt,
        blurhash: startBlock.blurhash,
        width: startBlock.width,
        height: startBlock.height,
        focalTop,
        focalLeft
      },
      true,
      startBlock
    )
  }

  // drops the unsaved drag and restores the saved position
  function revert(): void {
    const startBlock = startBlockRef.current
    cancelPreviewFrame()
    startBlockRef.current = null
    pointerIdRef.current = null
    if (startBlock == null) return

    const position = {
      x: startBlock.focalLeft ?? 50,
      y: startBlock.focalTop ?? 50
    }
    positionRef.current = position
    setLocalPosition(position)
    writeFocalPoint(startBlock.id, position)
  }

  // Undo/redo would act on saved history while the cache holds a preview, so
  // they cancel the drag first, as Escape does. This listens in the capture
  // phase to run before the editor's hotkeys.
  function handleWindowKeyDown(e: KeyboardEvent): void {
    if (startBlockRef.current == null) return

    const isUndoOrRedo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z'
    if (isUndoOrRedo || e.key === 'Escape') revert()
  }

  // window listeners outlive renders, so they call the latest handlers
  const latestHandlersRef = useRef({ handleWindowKeyDown, revert })
  latestHandlersRef.current = { handleWindowKeyDown, revert }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void =>
      latestHandlersRef.current.handleWindowKeyDown(e)
    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      // unmounting mid-drag (e.g. the drawer closes) drops the preview
      latestHandlersRef.current.revert()
    }
  }, [])

  function movePoint(e: React.PointerEvent): void {
    const point = calculatePoint(e, imageRef)
    if (point != null) setPosition(clampPosition(point))
  }

  // Pointer events cover mouse, touch and pen. The capture keeps the drag
  // going when the pointer leaves the image, so release always ends it.
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>): void {
    // other pointers are ignored until the dragging one is released
    if (imageBlock == null || e.button !== 0 || pointerIdRef.current != null)
      return

    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    pointerIdRef.current = e.pointerId
    startBlockRef.current = imageBlock
    movePoint(e)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>): void {
    if (e.pointerId === pointerIdRef.current) movePoint(e)
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>): void {
    if (e.pointerId === pointerIdRef.current) save()
  }

  // an interrupted drag (e.g. a system gesture) restores the saved position
  function handlePointerCancel(e: React.PointerEvent<HTMLDivElement>): void {
    if (e.pointerId === pointerIdRef.current) revert()
  }

  return (
    <>
      {imageBlock?.src != null && (
        <Stack
          sx={{
            gap: 4
          }}
        >
          <Typography variant="subtitle2">{t('Adjust View')}</Typography>
          <Box
            sx={{
              width: '100%',
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              bgcolor: 'background.default',
              borderRadius: 1
            }}
          >
            <Box
              ref={imageRef}
              sx={{
                height: '100%',
                aspectRatio: `${imageBlock?.width ?? 0} / ${
                  imageBlock?.height ?? 0
                }`,
                position: 'relative',
                display: 'flex',
                cursor: 'pointer',
                userSelect: 'none',
                // stops touch drags from scrolling the settings panel
                touchAction: 'none',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                overflow: 'hidden'
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
              <Image
                src={imageBlock.src}
                alt={imageBlock?.alt ?? ''}
                layout="fill"
                style={{ objectFit: 'cover' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '33.33%',
                  bottom: 0,
                  width: '1px',
                  backgroundColor: 'rgba(255,255,255,0.5)'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '66.66%',
                  bottom: 0,
                  width: '1px',
                  backgroundColor: 'rgba(255,255,255,0.5)'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '33.33%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  backgroundColor: 'rgba(255,255,255,0.5)'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '66.66%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  backgroundColor: 'rgba(255,255,255,0.5)'
                }}
              />
              <Box
                data-testid="focal-point-dot"
                sx={{
                  width: 25,
                  height: 25,
                  cursor: 'move',
                  borderRadius: '50%',
                  position: 'absolute',
                  pointerEvents: 'auto',
                  top: `${localPosition.y}%`,
                  left: `${localPosition.x}%`,
                  transform: 'translate(-50%, -50%)',
                  backdropFilter: 'blur(4px)',
                  border: '2px solid white',
                  boxShadow: (theme) => theme.shadows[3]
                }}
              />
            </Box>
          </Box>
        </Stack>
      )}
    </>
  )
}
