import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useRef, useState } from 'react'

import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'

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
  const theme = useTheme()
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const node = scrollRef.current
    const handleScroll = (): void => {
      if (node != null) {
        if (theme.direction === 'rtl') {
          setShowRightButton(node.scrollLeft < 0)
          setShowLeftButton(
            node.scrollLeft > node.clientWidth - node.scrollWidth
          )
        } else {
          setShowLeftButton(node.scrollLeft > 0)
          setShowRightButton(
            node.scrollLeft < node.scrollWidth - node.clientWidth
          )
        }
      }
    }

    if (node != null) {
      if (theme.direction === 'rtl') {
        setShowRightButton(false)
        setShowLeftButton(node.scrollLeft > node.clientWidth - node.scrollWidth)
        node.addEventListener('scroll', handleScroll)
      } else {
        setShowLeftButton(false)
        setShowRightButton(
          node.scrollLeft < node.scrollWidth - node.clientWidth
        )
        node.addEventListener('scroll', handleScroll)
      }
    }

    return () => {
      if (node != null) {
        node.removeEventListener('scroll', handleScroll)
      }
    }
  }, [theme.direction])

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
    const position =
      (variant === 'Left' && theme.direction === 'ltr') ||
      (variant === 'Right' && theme.direction === 'rtl')
        ? 'left'
        : 'right'

    console.log(position)

    return (
      <>
        <Box
          sx={{
            position: 'absolute',
            left: position === 'left' ? 0 : undefined,
            right: position === 'right' ? 0 : undefined,
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
            left: position === 'left' ? 0 : undefined,
            right: position === 'right' ? 0 : undefined,
            bgcolor: 'background.paper',
            borderRadius: '50%',
            boxShadow: (theme) => theme.shadows[2],
            zIndex: 2,
            '&:hover': {
              bgcolor: 'background.paper'
            }
          }}
        >
          {variant === 'Left' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
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
      data-testid="UnsplashCollections"
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
