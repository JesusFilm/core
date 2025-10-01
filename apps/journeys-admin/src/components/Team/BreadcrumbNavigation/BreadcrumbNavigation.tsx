import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography'
import get from 'lodash/get'
import isArray from 'lodash/isArray'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'

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

  function getLabel(segment: string): string {
    const isDynamicSegment = segment.startsWith('[') && segment.endsWith(']')
    if (isDynamicSegment) {
      const queryValue = get(router.query, segment.slice(1, -1))
      const dynamicLabel = isArray(queryValue)
        ? queryValue.join(', ')
        : queryValue
      return dynamicLabel ?? segment
    }
    return formatLabel(segment)
  }

  function processBreadcrumbItems(): BreadcrumbItem[] {
    if (activeTeam == null) return []
    return asPath
      .split('/')
      .filter(Boolean)
      .reduce<BreadcrumbItem[]>((acc, segment, index, arr) => {
        if (segment === 'teams') return acc

        const isTeamSegment = arr[index - 1] === 'teams'
        const path = isTeamSegment
          ? undefined
          : `/${arr.slice(0, index + 1).join('/')}`
        const label =
          isTeamSegment && segment === activeTeam.id
            ? `${activeTeam.title}'s Team`
            : getLabel(segment)

        acc.push({ label, path })
        return acc
      }, [])
  }
  const breadcrumbItems = processBreadcrumbItems()

  return (
    <Breadcrumbs aria-label="teams-breadcrumb" separator={<ChevronRightIcon />}>
      {breadcrumbItems?.map((item, index) => {
        const isLastItem = index === breadcrumbItems.length - 1
        return (
          <Box key={index}>
            {item.path != null && !isLastItem ? (
              <Typography
                component={NextLink}
                href={item.path}
                variant="h4"
                color="primary.main"
                sx={{ cursor: 'pointer', textDecoration: 'none' }}
              >
                {item.label}
              </Typography>
            ) : (
              <Typography
                variant="h4"
                color={isLastItem ? 'text.primary' : 'primary.main'}
              >
                {item.label}
              </Typography>
            )}
          </Box>
        )
      })}
    </Breadcrumbs>
  )
}
