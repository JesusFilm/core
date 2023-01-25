import { ReactElement, useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import Image from 'next/image'
import { Formik, Form } from 'formik'

interface UnsplashImage {
  id: number
  width: number
  height: number
  alt_description: string
  urls: {
    small: string
  }
  color: string | null
}

export function UnsplashLibrary(): ReactElement {
  const [results, setResults] = useState<UnsplashImage[]>()
  const accessKey = ''

  // TODO:
  // Move accessKey to doppler
  // On Image Click - Sets the unsplash image to be in the image block

  const getCollection = async (): Promise<void> => {
    const data = await fetch(
      `https://api.unsplash.com/collections/4924556/photos?page=1&per_page=20&client_id=${accessKey}`
    )
    const results = await data.json()
    if (results != null) {
      setResults(results)
    }
  }

  useEffect(() => {
    void getCollection()
  }, [])

  const fetchSearchRequest = async (image: string): Promise<void> => {
    const data = await fetch(
      `https://api.unsplash.com/search/photos?page=1&query=${image}&client_id=${accessKey}&per_page=20`
    )
    const formatData = await data.json()
    const results = formatData.results
    if (results != null) {
      setResults(results)
    }
  }

  return (
    <Stack>
      <Formik
        initialValues={{
          src: ''
        }}
        onSubmit={async (e) => await fetchSearchRequest(e.src)}
      >
        {({ values, handleChange }) => (
          <Form>
            <TextField
              id="src"
              name="src"
              variant="filled"
              label="Search free images"
              value={values.src}
              onChange={handleChange}
              fullWidth
            />
          </Form>
        )}
      </Formik>
      {results != null && (
        <ImageList variant="masonry">
          {results?.map((item) => (
            <ImageListItem key={item?.id}>
              <Image
                src={item.urls.small}
                alt={item.alt_description}
                width={item.width}
                height={item.height}
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Stack>
  )
}
