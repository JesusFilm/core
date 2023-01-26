import { ReactElement, useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import Image from 'next/image'
import fetch from 'node-fetch'
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

export function UnsplashGallery(): ReactElement {
  const [results, setResults] = useState<UnsplashImage[]>()
  const accessKey = ''

  // TODO:
  // Move accessKey to doppler
  // 7MUdE7NO3RSHYD3gefyyPD3nSBOK4vziireH3tnj9L0
  // On Image Click - Sets the unsplash image to be in the image block

  const getCollection = async (): Promise<void> => {
    const collectionData = await (
      await fetch(
        `https://api.unsplash.com/collections/4924556/photos?page=1&per_page=20&client_id=${accessKey}`
      )
    ).json()

    setResults(collectionData)
  }

  const fetchSearchRequest = async (image: string): Promise<void> => {
    const searchData = await (
      await fetch(
        `https://api.unsplash.com/search/photos?query=${image}&page=1&per_page=20&client_id=${accessKey}`
      )
    ).json()

    setResults(searchData.results)
  }

  useEffect(() => {
    void getCollection()
  }, [])

  return (
    <Stack sx={{ pt: 3 }}>
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
        <ImageList variant="masonry" cols={3}>
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
