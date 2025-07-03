'use client'

import { useQuery } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { graphql } from 'gql.tada'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { PublishedChip } from '../../../../../components/PublishedChip'
import { Section } from '../../../../../components/Section'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../constants'

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

  const { data, loading, refetch } = useQuery(GET_ADMIN_VIDEO_VARIANTS, {
    variables: { id: videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
  })

  useEffect(() => {
    if (reloadOnPathChange) void refetch()
    setReloadOnPathChange(
      (pathname?.includes('add') || pathname?.includes('delete')) ?? false
    )
  }, [pathname])

  const handleAddAudioLanguage = useCallback((): void => {
    router.push(`/videos/${videoId}/audio/add`, {
      scroll: false
    })
  }, [router, videoId])

  const handleVariantClick = useCallback(
    (variantId: string): void => {
      router.push(`/videos/${videoId}/audio/${variantId}`, {
        scroll: false
      })
    },
    [router, videoId]
  )

  const handlePreviewClick = useCallback(
    (
      event: React.MouseEvent,
      videoSlug: string,
      languageSlug: string
    ): void => {
      event.stopPropagation()
      window.open(
        `${process.env.NEXT_PUBLIC_WATCH_URL ?? ''}/watch/${videoSlug}.html/${languageSlug}.html`,
        '_blank',
        'noopener,noreferrer'
      )
    },
    []
  )

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent, variantId: string): void => {
      event.stopPropagation()
      router.push(`/videos/${videoId}/audio/${variantId}/delete`, {
        scroll: false
      })
    },
    [router, videoId]
  )

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100% - 60px)',
            gap: 2
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Loading audio languages...
          </Typography>
        </Box>
      )
    }

    if (!data?.adminVideo.variants || data.adminVideo.variants.length === 0) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100% - 60px)',
            gap: 2
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No audio languages found
          </Typography>
        </Box>
      )
    }

    return (
      <Box
        sx={{
          height: 'calc(100% - 60px)',
          overflow: 'auto',
          mt: 1
        }}
      >
        <List disablePadding>
          {data.adminVideo.variants.map((variant) => {
            const canPreview =
              variant.published &&
              data?.adminVideo?.published &&
              data?.adminVideo?.slug &&
              variant.language?.slug

            return (
              <ListItem
                key={variant.id}
                onClick={() => handleVariantClick(variant.id)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.default',
                  borderRadius: 1,
                  p: 1,
                  mb: 1,
                  '&:hover': {
                    cursor: 'pointer',
                    backgroundColor: 'action.hover'
                  },
                  transition: 'background-color 0.3s ease',
                  minHeight: 66,
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
                    onClick={
                      canPreview &&
                      data?.adminVideo?.slug &&
                      variant.language?.slug
                        ? (event) =>
                            handlePreviewClick(
                              event,
                              data.adminVideo.slug,
                              variant.language.slug as string
                            )
                        : undefined
                    }
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
                    onClick={(event) => handleDeleteClick(event, variant.id)}
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
          })}
        </List>
      </Box>
    )
  }

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
          onClick: handleAddAudioLanguage
        }}
      >
        {renderContent()}
      </Section>
      {children}
    </>
  )
}
