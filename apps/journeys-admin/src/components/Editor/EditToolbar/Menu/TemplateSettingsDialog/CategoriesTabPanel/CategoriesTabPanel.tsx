import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useFormikContext } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { GetTags_tags as Tags } from '../../../../../../../__generated__/GetTags'
import { useTagsQuery } from '../../../../../../libs/useTagsQuery'
import {
  AutocompleteOption,
  TagAutocomplete
} from '../../../../../TagAutocomplete'
import { TemplateSettingsFormValues } from '../../TemplateSettingsForm'

interface TagOptionsData {
  [id: string]: { label: string; children: AutocompleteOption[] }
}

export function CategoriesTabPanel(): ReactElement {
  const { t } = useTranslation()
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))
  const { parentTags, childTags } = useTagsQuery()
  const { values, setFieldValue } =
    useFormikContext<TemplateSettingsFormValues>()

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

  function handleOnChange(parentId, changedTagIds: readonly string[]): void {
    const tagIdsOfParentId = tags[parentId].children.map(({ value }) => value)
    const selectedIds =
      values.tagIds?.filter((tagId) => !tagIdsOfParentId.includes(tagId)) ?? []

    void setFieldValue('tagIds', [...selectedIds, ...changedTagIds])
  }

  return (
    <>
      {tags != null &&
        orderedTagsIds.map((tagId, index) => {
          if (tagId != null) {
            return (
              <Stack
                key={`${tags[tagId].label}-tag-autocomplete`}
                direction="row"
                alignItems="center"
              >
                {mdUp && (
                  <Typography variant="subtitle2" sx={{ width: 140 }}>
                    {t(orderedTagLabels[index])}
                  </Typography>
                )}
                <TagAutocomplete
                  parentId={tagId}
                  tags={tags[tagId].children}
                  selectedTagIds={values.tagIds}
                  onChange={handleOnChange}
                  label={!mdUp ? t(orderedTagLabels[index]) : undefined}
                  placeholder={
                    mdUp
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
    </>
  )
}
