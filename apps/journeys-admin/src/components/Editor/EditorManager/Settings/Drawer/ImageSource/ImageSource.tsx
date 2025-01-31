import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../__generated__/globalTypes'
import { ImageBlockHeader } from '../ImageBlockHeader'

const ImageLibrary = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ImageLibrary/ImageLibrary" */ '../ImageLibrary'
    ).then((mod) => mod.ImageLibrary),
  { ssr: false }
)

interface ImageSourceProps {
  selectedBlock?: ImageBlock | null
  onChange: (block: ImageBlockUpdateInput) => Promise<void>
  onDelete?: () => Promise<void>
  loading?: boolean
  error?: boolean
}

export function ImageSource({
  selectedBlock,
  onChange,
  onDelete,
  loading,
  error
}: ImageSourceProps): ReactElement {
  const router = useRouter()
  const [open, setOpen] = useState<boolean | undefined>()

  const handleImageDelete = async (): Promise<void> => {
    if (onDelete != null) {
      await onDelete()
    }
  }

  function handleClick(): void {
    setOpen(true)
    const param = 'unsplash-image'
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          height: 73,
          borderRadius: 2
        }}
        data-testid="ImageSource"
      >
        <CardActionArea
          data-testid="card click area"
          onClick={handleClick}
          sx={{
            height: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            display: 'flex'
          }}
        >
          <ImageBlockHeader selectedBlock={selectedBlock} showAdd />
        </CardActionArea>
      </Card>
      {open != null && (
        <ImageLibrary
          open={open}
          onClose={() => setOpen(false)}
          onChange={onChange}
          onDelete={handleImageDelete}
          selectedBlock={selectedBlock}
          loading={loading}
          error={error}
        />
      )}
    </>
  )
}
