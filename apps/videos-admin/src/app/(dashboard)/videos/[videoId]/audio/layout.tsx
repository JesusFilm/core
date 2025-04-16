'use client'

import { useQuery } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { graphql } from 'gql.tada'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FixedSizeList } from 'react-window'

import { Section } from '../../../../../components/Section'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../constants'

const ITEM_SIZE = 75

const GET_ADMIN_VIDEO_VARIANTS = graphql(`
  query GetAdminVideoVariants($id: ID!, $languageId: ID) {
    adminVideo(id: $id) {
      id
      variants {
        id
        language {
          id
          name(languageId: $languageId) {
            value
          }
        }
      }
    }
  }
`)

export default function ClientLayout({
  children,
  params: { videoId }
}: {
  children: React.ReactNode
  params: { videoId: string }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [reloadOnPathChange, setReloadOnPathChange] = useState(false)

  const { data, refetch } = useQuery(GET_ADMIN_VIDEO_VARIANTS, {
    variables: { id: videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
  })

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

  useEffect(() => {
    if (reloadOnPathChange) void refetch()
    setReloadOnPathChange(
      (pathname?.includes('add') || pathname?.includes('delete')) ?? false
    )
  }, [pathname])

  return (
    <>
      <Section
        boxProps={{
          sx: { p: 2, height: 'calc(100vh - 400px)' }
        }}
        title="Audio Languages"
        variant="outlined"
        action={{
          label: 'Add Audio Language',
          startIcon: <AddIcon />,
          onClick: () =>
            router.push(`/videos/${videoId}/audio/add`, {
              scroll: false
            })
        }}
      >
        <FixedSizeList
          width={size.width - 20}
          height={size.height - 90}
          itemData={data?.adminVideo.variants}
          itemCount={data?.adminVideo.variants.length ?? 0}
          itemSize={ITEM_SIZE}
          itemKey={(index, data) => data[index].id}
          overscanCount={10}
          style={{
            marginTop: 8
          }}
        >
          {({ index, data }) => {
            const variant = data[index]
            return (
              <ListItem
                key={variant.id}
                onClick={() =>
                  router.push(`/videos/${videoId}/audio/${variant.id}`, {
                    scroll: false
                  })
                }
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.default',
                  borderRadius: 1,
                  p: 1,
                  '&:hover': {
                    cursor: 'pointer',
                    backgroundColor: 'action.hover'
                  },
                  transition: 'background-color 0.3s ease',
                  // ...style,
                  // css below the spread styles will override react-window styles, use with caution
                  height: 66,
                  width: 'calc(100% - 20px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <ListItemText
                  primary={variant.language.name[0].value}
                  secondary={variant.language.id}
                />
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation()
                    router.push(
                      `/videos/${videoId}/audio/${variant.id}/delete`,
                      {
                        scroll: false
                      }
                    )
                  }}
                  aria-label="delete variant"
                  sx={{
                    color: 'error.main',
                    ml: 1,
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'error.contrastText'
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItem>
            )
          }}
        </FixedSizeList>
      </Section>
      {children}
    </>
  )
}
