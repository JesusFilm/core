import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useRef, useState } from 'react'

interface UnsplashCollectionsProps {
  onClick: (collectionId: string, query: string) => void
}

interface Collection {
  label: string
  collectionId: string
}

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

export function UnsplashCollections({
  onClick
}: UnsplashCollectionsProps): ReactElement {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const node = scrollRef.current
    const handleScroll = (): void => {
      if (node != null) {
        setShowLeftButton(node.scrollLeft > 0)
        setShowRightButton(
          node.scrollLeft < node.scrollWidth - node.clientWidth
        )
      }
    }

    if (node != null) {
      setShowLeftButton(false)
      setShowRightButton(node.scrollLeft < node.scrollWidth - node.clientWidth)
      node.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (node != null) {
        node.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  const scrollLeft = (): void => {
    if (scrollRef.current != null) {
      scrollRef.current.scrollLeft -= 300
    }
  }

  const scrollRight = (): void => {
    if (scrollRef.current != null) {
      scrollRef.current.scrollLeft += 300
    }
  }

  const Navigation = ({
    variant
  }: {
    variant: 'Left' | 'Right'
  }): ReactElement => {
    return (
      <>
        <Box
          sx={{
            position: 'absolute',
            left: variant === 'Left' ? 0 : undefined,
            right: variant === 'Right' ? 0 : undefined,
            top: 0,
            bottom: 0,
            width: '30px',
            zIndex: 1,
            background:
              variant === 'Left'
                ? 'linear-gradient(to left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)'
                : variant === 'Right'
                ? 'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)'
                : 'transparent'
          }}
        />
        <IconButton
          aria-label={`Scroll ${variant}`}
          size="small"
          onClick={variant === 'Left' ? scrollLeft : scrollRight}
          sx={{
            position: 'absolute',
            top: '30%',
            left: variant === 'Left' ? 0 : undefined,
            right: variant === 'Right' ? 0 : undefined,
            bgcolor: 'background.paper',
            borderRadius: '50%',
            boxShadow: (theme) => theme.shadows[2],
            zIndex: 2,
            '&:hover': {
              bgcolor: 'background.paper'
            }
          }}
        >
          {variant === 'Left' ? (
            <ChevronLeftRounded />
          ) : (
            <ChevronRightRounded />
          )}
        </IconButton>
      </>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        pt: 5,
        pb: 2,
        position: 'relative'
      }}
    >
      <Box
        data-testid="collections"
        ref={scrollRef}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          scrollBehavior: 'smooth'
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {showLeftButton && isHovering && <Navigation variant="Left" />}

        {collections.map((collection) => (
          <Chip
            key={collection.collectionId}
            onClick={() => onClick(collection.collectionId, collection.label)}
            label={<Typography variant="body2">{collection.label}</Typography>}
            sx={{
              mr: 2,
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              '&:hover': {
                bgcolor: 'background.default'
              }
            }}
          />
        ))}

        {showRightButton && isHovering && <Navigation variant="Right" />}
      </Box>
    </Box>
  )
}
