import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TabPanel } from '@core/shared/ui/TabPanel'

import { GetTags_tags as Tags } from '../../../../../../__generated__/GetTags'
import { useTagsQuery } from '../../../../../libs/useTagsQuery'
import {
  AutocompleteOption,
  TagAutocomplete
} from '../../../../TagAutocomplete'
import { ParentTagIcon } from '../../../../TemplateView/TemplateTags/ParentTagIcon'

interface TagOptionsData {
  [id: string]: { label: string; children: AutocompleteOption[] }
}

interface TagValue {
  id: string
  parentId: string
}

interface CategoriesTabPanelProps {
  tabValue: number
  initialTags?: TagValue[]
  onChange: (field: string, value: TagValue[]) => void
}

export function CategoriesTabPanel({
  tabValue,
  initialTags,
  onChange
}: CategoriesTabPanelProps): ReactElement {
  const { t } = useTranslation()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { parentTags, childTags } = useTagsQuery()
  const [selectedTags, setSelectedTags] = useState<TagValue[]>(
    initialTags ?? []
  )

  // TODO: Update when supporting multiple languages for tags
  const populateTagDataByParentId = (
    previousTags: TagOptionsData,
    parentTag: Tags
  ): TagOptionsData => ({
    ...previousTags,
    [parentTag.id]: { label: parentTag.name[0].value, children: [] }
  })
  const tags = parentTags?.reduce(populateTagDataByParentId, {})
  // Populate TagData with children
  childTags?.forEach((tag) => {
    if (tag.parentId != null && tags != null) {
      tags[tag.parentId].children.push({
        value: tag.id,
        label: tag.name[0].value
      })
    }
  })

  // Ordered by name instead of id since id changes between environments
  const orderedTagLabels = [
    'Topics',
    'Felt Needs',
    'Holidays',
    'Audience',
    'Genre',
    'Collections'
  ]
  const orderedTagsIds = orderedTagLabels.map(
    (tagName) => parentTags?.find((tag) => tagName === tag.name[0].value)?.id
  )

  const handleOnChange = (
    parentId,
    changedTags: readonly AutocompleteOption[]
  ): void => {
    const unchangedTagGroups = selectedTags.filter(
      (tag) => parentId !== tag.parentId
    )
    const updatedTags = changedTags.map((tag) => ({ parentId, id: tag.value }))

    // Combine unique selected tags from all autocompletes
    const selected = [...unchangedTagGroups, ...updatedTags]
    setSelectedTags(selected)

    onChange('tags', selected)
  }

  return (
    <TabPanel name="template-categories-settings" value={tabValue} index={1}>
      <Stack gap={4} sx={{ pt: 6 }}>
        {tags != null &&
          orderedTagsIds.map((tagId, index) => {
            if (tagId != null) {
              return (
                <Stack
                  gap={4}
                  key={`${tags[tagId].label}-tag-autocomplete`}
                  direction="row"
                  alignItems="center"
                >
                  <ParentTagIcon
                    name={orderedTagLabels[index]}
                    sx={{ color: 'secondary.light' }}
                  />
                  {smUp && (
                    <Typography
                      variant="subtitle2"
                      sx={{ width: 140, color: 'secondary.light' }}
                    >
                      {t(orderedTagLabels[index])}
                    </Typography>
                  )}
                  <TagAutocomplete
                    parentId={tagId}
                    tags={tags[tagId].children}
                    selectedTagIds={selectedTags.map((tag) => tag.id)}
                    onChange={handleOnChange}
                    label={!smUp ? t(orderedTagLabels[index]) : undefined}
                    placeholder={
                      smUp
                        ? `${t('Add')} ${t(
                            orderedTagLabels[index]
                          ).toLowerCase()}`
                        : undefined
                    }
                  />
                </Stack>
              )
            }
            return null
          })}
      </Stack>
    </TabPanel>
  )
}
