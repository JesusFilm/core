'use client'

import { useQuery } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { graphql } from 'gql.tada'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FixedSizeList } from 'react-window'

import { PublishedChip } from '../../../../../components/PublishedChip'
import { Section } from '../../../../../components/Section'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../constants'

const ITEM_SIZE = 75

const GET_ADMIN_VIDEO_VARIANTS = graphql(`
  query GetAdminVideoVariants($id: ID!, $languageId: ID) {
    adminVideo(id: $id) {
      id
      slug
      published
      variants(input: { onlyPublished: false }) {
        id
        published
        language {
          id
          slug
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
          {({ index, data: variants }) => {
            const variant = variants[index]
            const canPreview =
              variant.published &&
              data?.adminVideo?.published &&
              data?.adminVideo?.slug &&
              variant.language?.slug

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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ListItemText
                    primary={variant.language.name[0].value}
                    secondary={variant.language.id}
                  />
                  <PublishedChip published={variant.published} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation()
                      if (canPreview) {
                        window.open(
                          `${process.env.NEXT_PUBLIC_WATCH_URL ?? ''}/watch/${data?.adminVideo?.slug}.html/${variant.language.slug}.html`,
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }
                    }}
                    aria-label="preview variant"
                    disabled={!canPreview}
                    sx={{
                      color: canPreview ? 'primary.main' : 'action.disabled',
                      '&:hover': canPreview
                        ? {
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText'
                          }
                        : {},
                      '&.Mui-disabled': {
                        color: 'action.disabled'
                      }
                    }}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
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
                      '&:hover': {
                        backgroundColor: 'error.light',
                        color: 'error.contrastText'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            )
          }}
        </FixedSizeList>
      </Section>
      {children}
    </>
  )
}
