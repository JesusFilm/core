import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { string } from 'prop-types'
import { ReactElement } from 'react'
import { useTeam } from '../TeamProvider'

interface BreadcrumbItem {
  label: string
  path?: string
}

export function BreadcrumbNavigation(): ReactElement {
  const router = useRouter()
  const { asPath } = router
  const { activeTeam } = useTeam()

  function formatLabel(label: string): string {
    return label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, ' ')
  }

  function processBreadcrumbItems() {
    if (activeTeam == null) return
    return asPath
      .split('/')
      .filter(Boolean)
      .reduce<BreadcrumbItem[]>((acc, segment, index, arr) => {
        if (segment === 'teams') return acc

        let path: string | undefined = `/${arr.slice(0, index + 1).join('/')}`
        let label = segment

        if (arr[index - 1] === 'teams') {
          if (segment === activeTeam.id) label = `${activeTeam.title}'s Team`
          path = undefined
        } else {
          const isDynamic = segment.startsWith('[') && segment.endsWith(']')
          const queryValue = router.query[segment.slice(1, -1)]
          label = isDynamic
            ? (Array.isArray(queryValue)
                ? queryValue.join(', ')
                : queryValue) || segment
            : formatLabel(segment)
        }
        acc?.push({ label, path })
        return acc
      }, [])
  }
  const breadcrumbItems = processBreadcrumbItems()

  return (
    <Breadcrumbs aria-label="teams-breadcrumb" separator={<ChevronRightIcon />}>
      {breadcrumbItems?.map((item, index) => (
        <Box key={index}>
          {index < breadcrumbItems?.length - 1 ? (
            item.path ? (
              <NextLink href={item.path} passHref legacyBehavior>
                <Typography
                  variant="h4"
                  color="primary.main"
                  sx={{ cursor: 'pointer' }}
                >
                  {item.label}
                </Typography>
              </NextLink>
            ) : (
              <Typography variant="h4" color="primary.main">
                {item.label}
              </Typography>
            )
          ) : (
            <Typography variant="h4" color="text.primary">
              {item.label}
            </Typography>
          )}
        </Box>
      ))}
    </Breadcrumbs>
  )
}
