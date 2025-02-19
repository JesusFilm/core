import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Checkbox from '@mui/material/Checkbox'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { FieldArray, Form, Formik } from 'formik'
import { Dispatch, ReactElement, SetStateAction } from 'react'

import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'

interface LanguageOptions {
  languages: LanguageOption[]
}

interface LanguagesFilterPopperProps {
  initialValues: LanguageOption[]
  onSubmit: (values: LanguageOptions) => void
  setOpen: Dispatch<SetStateAction<boolean>>
  open: boolean
  anchorEl: HTMLElement | null
  sortedLanguages: LanguageOption[]
}

interface LanguageOptions {
  languages: LanguageOption[]
}

const StyledPopperOption = styled(ButtonBase)(() => ({
  backgroundColor: 'transparent',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center'
}))

export function LanguagesFilterPopper({
  initialValues,
  onSubmit,
  setOpen,
  open,
  anchorEl,
  sortedLanguages
}: LanguagesFilterPopperProps): ReactElement {
  const { zIndex } = useTheme()

  return (
    <Formik
      initialValues={{
        languages: initialValues
      }}
      onSubmit={(values: LanguageOptions) => onSubmit(values)}
      enableReinitialize
    >
      {({ values, handleSubmit }) => (
        <>
          <Box
            data-testid="PresentationLayer"
            onClick={() => {
              handleSubmit()
              setOpen(!open)
            }}
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'transparent',
              zIndex: zIndex.fab,
              display: open ? 'block' : 'none'
            }}
          />
          <Form
            style={{
              display: open ? 'block' : 'none',
              width: '100%',
              maxWidth: 'calc(100% - 25px)'
            }}
          >
            <FieldArray name="languages">
              {/* eslint-disable-next-line @typescript-eslint/unbound-method */}
              {({ push, remove }) => (
                <Popper
                  open={open}
                  anchorEl={anchorEl}
                  sx={{
                    zIndex: zIndex.fab,
                    py: 2,
                    backgroundColor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 2,
                    minWidth: 200,
                    maxHeight: '85svh',
                    overflowY: 'scroll',
                    width: { xs: '100%', md: anchorEl?.clientWidth }
                  }}
                  placement="bottom-start"
                >
                  <Stack>
                    {sortedLanguages.map(({ localName, nativeName, id }) => {
                      function handleChange(): void {
                        values.languages.some((language) => language.id === id)
                          ? remove(
                              values.languages.findIndex(
                                (lang) => lang.id === id
                              )
                            )
                          : push({ id, localName, nativeName })
                        handleSubmit()
                      }
                      return (
                        <StyledPopperOption
                          value={id}
                          key={id}
                          onClick={handleChange}
                        >
                          <Checkbox
                            name="languages"
                            value={id}
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            sx={{ mr: 2 }}
                            checked={values?.languages?.some(
                              (language) => language.id === id
                            )}
                          />
                          <Stack
                            alignItems="flex-start"
                            sx={{
                              width: 200,
                              pr: 1,
                              flexGrow: 1
                            }}
                          >
                            <Typography
                              sx={{
                                textAlign: 'start',
                                width: '100%',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden'
                              }}
                            >
                              {localName ?? nativeName}
                            </Typography>

                            {localName != null && nativeName != null && (
                              <Typography
                                sx={{
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden'
                                }}
                                variant="body2"
                                color="text.secondary"
                              >
                                {nativeName}
                              </Typography>
                            )}
                          </Stack>
                        </StyledPopperOption>
                      )
                    })}
                  </Stack>
                </Popper>
              )}
            </FieldArray>
          </Form>
        </>
      )}
    </Formik>
  )
}
