import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

interface UnsplashCollectionsProps {
  onClick: (collectionId: string) => void
}

interface Collection {
  label: string
  collectionId: string
}

export function UnsplashCollections({
  onClick
}: UnsplashCollectionsProps): ReactElement {
  // TODO: left and right buttons to show and function

  const collections: Collection[] = [
    { label: 'Christ', collectionId: '5TziIavS84o' },
    { label: 'Church', collectionId: 'uOF0tIcPnUA' },
    { label: 'Prayer', collectionId: 'Ni0miBH9Kq4' },
    { label: 'Bible', collectionId: 'sio7jwScQ3Y' },
    { label: 'Freedom', collectionId: 'suOnfoiJA28' },
    { label: 'Help', collectionId: 'tOLIIS0f-cs' },
    { label: 'Love', collectionId: '5CVp4N4NJJY' },
    { label: 'Friendship', collectionId: 'lVT6hMR5sgw' },
    { label: 'Loneliness', collectionId: 'ZkncIJm2hEg' },
    { label: 'Nature', collectionId: '5Eg2lXLW_a4' },
    { label: 'Joy', collectionId: 'PLkk_lWhzw8' },
    { label: 'Depression', collectionId: 'Jd3YjXnNetw' }
  ]

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'scroll',
        pt: 5,
        pb: 9
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {collections.map((collection) => (
          <Chip
            key={collection.collectionId}
            label={collection.label}
            onClick={() => onClick(collection.collectionId)}
            color="default"
            sx={{ mr: 2 }}
          />
        ))}
      </Box>
    </Box>
  )
}
