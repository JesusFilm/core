'use client'

import { gql, useQuery } from '@apollo/client'
import SearchIcon from '@mui/icons-material/Search'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowsProp,
  gridClasses
} from '@mui/x-data-grid'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import {
  DEFAULT_LANGUAGE_ID,
  GET_JESUS_FILM_VARIANTS,
  JESUS_FILM_VIDEO_ID,
  LINKED_LANGUAGE_STUDIO_MANAGED_FILMS_LABEL,
  getJesusFilmTitle,
  getJesusFilmVariantPath,
  getJesusFilmVariantsByLanguageId
} from '../_JesusFilmVersion/jesusFilmVersion'
import type {
  GetJesusFilmData,
  GetJesusFilmVariables,
  JesusFilmVariant
} from '../_JesusFilmVersion/jesusFilmVersion'

const DEFAULT_PAGE_SIZE = 25

export const GET_LANGUAGES = gql`
  query GetLanguagesForAdmin(
    $limit: Int
    $offset: Int
    $term: String
    $where: AdminLanguagesFilter
    $nameLanguageId: ID
  ) {
    adminLanguages(limit: $limit, offset: $offset, term: $term, where: $where) {
      id
      bcp47
      iso3
      slug
      hasVideos
      name(languageId: $nameLanguageId) {
        id
        languageId
        value
        primary
      }
      nativeName: name(primary: true) {
        id
        languageId
        value
        primary
      }
    }
    adminLanguagesCount(term: $term, where: $where)
  }
`

interface LanguageName {
  id: string
  languageId: string
  value: string
  primary: boolean
}

interface Language {
  id: string
  bcp47?: string | null
  iso3?: string | null
  slug?: string | null
  hasVideos: boolean
  name: LanguageName[]
  nativeName: LanguageName[]
}

interface GetLanguagesData {
  adminLanguages: Language[]
  adminLanguagesCount: number
}

interface AdminLanguagesFilter {
  hasVideos?: boolean
}

interface GetLanguagesVariables {
  limit: number
  offset: number
  term?: string
  where?: AdminLanguagesFilter
  nameLanguageId: string
}

interface LanguageRow {
  id: string
  name: string
  nameLanguageId: string
  nativeName: string
  bcp47: string
  iso3: string
  slug: string
  hasVideos: boolean
  jesusFilmTitle: string
  jesusFilmVariant?: JesusFilmVariant
}

function getPrimaryName(names: LanguageName[]): LanguageName | undefined {
  return names.find((name) => name.primary) ?? names[0]
}

function getLocalizedName(names: LanguageName[]): LanguageName | undefined {
  return (
    names.find((name) => name.languageId === DEFAULT_LANGUAGE_ID) ??
    getPrimaryName(names)
  )
}

function handleLinkedFilmClick(event: MouseEvent<HTMLDivElement>): void {
  event.stopPropagation()
}

export function LanguageList(): ReactElement {
  const router = useRouter()
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE
  })
  const paginationModelRef = useRef(paginationModel)
  const [searchTerm, setSearchTerm] = useState('')
  const [term, setTerm] = useState<string>()
  const [hasVideosFilter, setHasVideosFilter] = useState('yes')
  const [gridMounted, setGridMounted] = useState(false)

  useEffect(() => {
    setGridMounted(true)
  }, [])

  useEffect(() => {
    paginationModelRef.current = paginationModel
  }, [paginationModel])

  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextTerm = searchTerm.trim() || undefined
      setTerm((current) => (current === nextTerm ? current : nextTerm))
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchTerm])

  const where = useMemo<AdminLanguagesFilter | undefined>(() => {
    if (hasVideosFilter === 'all') return undefined
    return { hasVideos: hasVideosFilter === 'yes' }
  }, [hasVideosFilter])

  const resetToFirstPage = useCallback((): void => {
    setPaginationModel((current) => {
      if (current.page === 0) return current
      const next = { ...current, page: 0 }
      paginationModelRef.current = next
      return next
    })
  }, [])

  const handlePaginationModelChange = useCallback(
    (model: GridPaginationModel): void => {
      const current = paginationModelRef.current
      if (current.page === model.page && current.pageSize === model.pageSize)
        return

      paginationModelRef.current = model
      setPaginationModel(model)
    },
    []
  )

  const { data, loading } = useQuery<GetLanguagesData, GetLanguagesVariables>(
    GET_LANGUAGES,
    {
      variables: {
        limit: paginationModel.pageSize,
        offset: paginationModel.page * paginationModel.pageSize,
        nameLanguageId: DEFAULT_LANGUAGE_ID,
        term,
        where
      }
    }
  )
  const { data: jesusFilmData, loading: jesusFilmLoading } = useQuery<
    GetJesusFilmData,
    GetJesusFilmVariables
  >(GET_JESUS_FILM_VARIANTS, {
    variables: { id: JESUS_FILM_VIDEO_ID, languageId: DEFAULT_LANGUAGE_ID }
  })

  const jesusFilmTitle = getJesusFilmTitle(jesusFilmData)

  const jesusFilmVariantsByLanguageId = useMemo(
    () => getJesusFilmVariantsByLanguageId(jesusFilmData),
    [jesusFilmData?.adminVideo.variants]
  )

  const rows: GridRowsProp<LanguageRow> = useMemo(
    () =>
      data?.adminLanguages.map((language) => {
        const primaryName = getPrimaryName(language.nativeName)
        const localizedName = getLocalizedName(language.name)

        return {
          id: language.id,
          name: localizedName?.value ?? '',
          nameLanguageId: localizedName?.languageId ?? DEFAULT_LANGUAGE_ID,
          nativeName:
            primaryName?.languageId === localizedName?.languageId
              ? ''
              : (primaryName?.value ?? ''),
          bcp47: language.bcp47 ?? '',
          iso3: language.iso3 ?? '',
          slug: language.slug ?? '',
          hasVideos: language.hasVideos,
          jesusFilmTitle,
          jesusFilmVariant: jesusFilmVariantsByLanguageId.get(language.id)
        }
      }) ?? [],
    [data?.adminLanguages, jesusFilmTitle, jesusFilmVariantsByLanguageId]
  )

  const columns: GridColDef<LanguageRow>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 112
    },
    {
      field: 'name',
      headerName: 'Language name',
      flex: 1,
      minWidth: 240
    },
    {
      field: 'hasVideos',
      headerName: 'Has Videos',
      width: 124,
      type: 'boolean',
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value === true ? 'Yes' : 'No'}
          color={params.value === true ? 'success' : 'default'}
          variant={params.value === true ? 'filled' : 'outlined'}
        />
      )
    },
    {
      field: 'nativeName',
      headerName: 'Native name',
      flex: 1,
      minWidth: 200,
      sortable: false,
      filterable: false
    },
    { field: 'bcp47', headerName: 'BCP 47', width: 112 },
    { field: 'iso3', headerName: 'ISO 3', width: 112 },
    { field: 'slug', headerName: 'Slug', flex: 1, minWidth: 180 },
    {
      field: 'jesusFilmVariant',
      headerName: LINKED_LANGUAGE_STUDIO_MANAGED_FILMS_LABEL,
      flex: 1,
      minWidth: 320,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const variant = params.row.jesusFilmVariant

        if (variant == null) {
          return (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          )
        }

        return (
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ minWidth: 0 }}
            onClick={handleLinkedFilmClick}
          >
            <Typography variant="body2" noWrap>
              {params.row.jesusFilmTitle}:
            </Typography>
            <Link
              component={NextLink}
              href={getJesusFilmVariantPath(variant.id)}
              underline="hover"
              sx={{ flexShrink: 0, fontWeight: 600 }}
            >
              {variant.version}
            </Link>
            <Typography variant="body2" noWrap>
              : {JESUS_FILM_VIDEO_ID}
            </Typography>
          </Stack>
        )
      }
    }
  ]

  return (
    <Stack
      sx={{
        width: '100%',
        maxWidth: { sm: '100%', md: '1700px' },
        alignSelf: 'stretch',
        height: { xs: 'calc(100svh - 160px)', md: 'calc(100vh - 150px)' },
        minHeight: 0,
        overflow: 'hidden',
        pt: { xs: 4, md: 0 }
      }}
      spacing={2}
    >
      <Typography component="h2" variant="h6" sx={{ flexShrink: 0 }}>
        Language Admin
      </Typography>

      <Paper
        sx={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]:
            {
              outline: 'none'
            },
          [`& .${gridClasses.row}`]: {
            cursor: 'pointer'
          }
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ p: 2, pb: 1, flexShrink: 0 }}
        >
          <TextField
            placeholder="Search by language name or ID"
            inputProps={{ 'aria-label': 'Search languages' }}
            value={searchTerm}
            onChange={(event) => {
              resetToFirstPage()
              setSearchTerm(event.target.value)
            }}
            size="small"
            sx={{ width: { xs: '100%', sm: 360 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
          <TextField
            select
            label="Has videos"
            value={hasVideosFilter}
            onChange={(event) => {
              resetToFirstPage()
              setHasVideosFilter(event.target.value)
            }}
            size="small"
            sx={{ width: { xs: '100%', sm: 160 } }}
          >
            <MenuItem value="all">Any</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </TextField>
        </Stack>

        <Box sx={{ flex: '1 1 auto', minHeight: { xs: 360, sm: 420 } }}>
          {gridMounted ? (
            <DataGrid
              sx={{ height: '100%', minHeight: { xs: 360, sm: 420 } }}
              rows={rows}
              columns={columns}
              rowCount={data?.adminLanguagesCount ?? 0}
              loading={loading || jesusFilmLoading}
              paginationMode="server"
              disableColumnFilter
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
              pageSizeOptions={[25, 50, 100]}
              onRowClick={(params) => router.push(`/languages/${params.id}`)}
              disableRowSelectionOnClick
            />
          ) : (
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                height: '100%',
                justifyContent: 'center',
                minHeight: { xs: 360, sm: 420 }
              }}
            >
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
      </Paper>
    </Stack>
  )
}

export { GET_JESUS_FILM_VARIANTS }
