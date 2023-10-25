import { gql, useMutation, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik } from 'formik'
import pick from 'lodash/pick'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { SubmitListener } from '@core/shared/ui/SubmitListener'

import { GetVisitorForForm } from '../../../../__generated__/GetVisitorForForm'
import {
  MessagePlatform,
  VisitorStatus
} from '../../../../__generated__/globalTypes'
import { VisitorUpdate } from '../../../../__generated__/VisitorUpdate'
import { messagePlatformToLabel } from '../VisitorJourneysList/utils'

import { ChatButton } from './ChatButton'

export const GET_VISITOR_FOR_FORM = gql`
  query GetVisitorForForm($id: ID!) {
    visitor(id: $id) {
      countryCode
      id
      lastChatStartedAt
      messagePlatformId
      messagePlatform
      name
      notes
      status
    }
  }
`

export const VISITOR_UPDATE = gql`
  mutation VisitorUpdate($id: ID!, $input: VisitorUpdateInput!) {
    visitorUpdate(id: $id, input: $input) {
      id
      messagePlatformId
      messagePlatform
      name
      notes
      status
    }
  }
`

interface DetailsFormProps {
  id: string
}

export function DetailsForm({ id }: DetailsFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [visitorUpdate] = useMutation<VisitorUpdate>(VISITOR_UPDATE)
  // 529 (english) should be changed when adding internalization
  const { data } = useQuery<GetVisitorForForm>(GET_VISITOR_FOR_FORM, {
    variables: { id }
  })

  async function handleSubmit(values): Promise<void> {
    const formattedValues = Object.keys(values).reduce((acc, key) => {
      acc[key] = values[key] === '' ? null : values[key]
      return acc
    }, {})
    await visitorUpdate({
      variables: {
        id,
        input: formattedValues
      }
    })
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: 0 }}>
      {data?.visitor != null && (
        <Formik
          initialValues={pick(data.visitor, [
            'messagePlatform',
            'messagePlatformId',
            'name',
            'notes',
            'status'
          ])}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <Stack>
                <Box sx={{ px: 4 }}>
                  <Stack direction="row" sx={{ py: 4 }}>
                    {/* Start chat */}
                    <ChatButton
                      messagePlatform={data.visitor.messagePlatform}
                      messagePlatformId={data.visitor.messagePlatformId}
                    />

                    {/* Status */}
                    <FormControl sx={{ width: 80, ml: 'auto' }}>
                      <Select
                        labelId="status-label"
                        id="status"
                        name="status"
                        value={values.status ?? ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        <MenuItem value="">⚪️</MenuItem>
                        <MenuItem value={VisitorStatus.star}>⭐</MenuItem>
                        <MenuItem value={VisitorStatus.prohibited}>🚫</MenuItem>
                        <MenuItem value={VisitorStatus.checkMarkSymbol}>
                          ✅
                        </MenuItem>
                        <MenuItem value={VisitorStatus.thumbsUp}>👍</MenuItem>
                        <MenuItem value={VisitorStatus.thumbsDown}>👎</MenuItem>
                        <MenuItem value={VisitorStatus.partyPopper}>
                          🎉
                        </MenuItem>
                        <MenuItem value={VisitorStatus.warning}>⚠</MenuItem>
                        <MenuItem value={VisitorStatus.robotFace}>🤖</MenuItem>
                        <MenuItem value={VisitorStatus.redExclamationMark}>
                          ❗
                        </MenuItem>
                        <MenuItem value={VisitorStatus.redQuestionMark}>
                          ❓
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>

                  {/* Platform */}
                  <FormControl fullWidth variant="filled" sx={{ pb: 4 }}>
                    <InputLabel id="message-platform-label">
                      {t('Chat Platform')}
                    </InputLabel>
                    <Select
                      labelId="message-platform-label"
                      id="messagePlatform"
                      name="messagePlatform"
                      value={values.messagePlatform ?? ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{
                        '.MuiSelect-select': {
                          height: 23
                        }
                      }}
                    >
                      <MenuItem value="">{t('None')}</MenuItem>
                      {Object.values(MessagePlatform).map((value) => (
                        <MenuItem key={value} value={value}>
                          {messagePlatformToLabel(value, t)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Username */}
                  <TextField
                    id="messagePlatformId"
                    name="messagePlatformId"
                    variant="filled"
                    label={t('Username')}
                    fullWidth
                    value={values.messagePlatformId ?? ''}
                    error={
                      touched.messagePlatformId === true &&
                      Boolean(errors.messagePlatformId)
                    }
                    helperText={
                      touched.messagePlatformId === true &&
                      (errors.messagePlatformId as string)
                    }
                    onBlur={handleBlur}
                    onChange={handleChange}
                    sx={{ pb: 4 }}
                  />
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Box sx={{ px: 4, pb: 5 }}>
                  {/* name */}
                  <TextField
                    id="name"
                    name="name"
                    variant="filled"
                    label={t('Name')}
                    fullWidth
                    value={values.name ?? data.visitor.id}
                    error={touched.name === true && Boolean(errors.name)}
                    helperText={
                      touched.name === true && (errors.name as string)
                    }
                    onBlur={handleBlur}
                    onChange={handleChange}
                    sx={{ pb: 4 }}
                  />

                  {/* note */}
                  <TextField
                    id="notes"
                    name="notes"
                    variant="filled"
                    label={t('Private Note')}
                    fullWidth
                    value={values.notes ?? ''}
                    error={touched.notes === true && Boolean(errors.notes)}
                    helperText={
                      touched.notes === true && (errors.notes as string)
                    }
                    onBlur={handleBlur}
                    onChange={handleChange}
                    multiline
                    minRows={2}
                    sx={{ pb: 4 }}
                  />
                  <Typography variant="caption">
                    {t('Visible to your team only')}
                  </Typography>
                </Box>
              </Stack>
              <SubmitListener />
            </Form>
          )}
        </Formik>
      )}
    </Paper>
  )
}
