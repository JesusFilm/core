import { expect, test } from '@playwright/test'

/*  
Check https://arc.gt/s/1_jf-0-0/529 is redirected to
https://www.jesusfilm.org/watch/jesus.html/english.html 
*/

test('Check https://arc.gt/s/1_jf-0-0/529 is redirected to https://www.jesusfilm.org/watch/jesus.html/english.html', async ({
  page
}) => {
  const response = await page.goto('https://arc.gt/s/1_jf-0-0/529')
  expect(response?.status()).toEqual(200)
  expect(response?.url()).toEqual(
    'https://www.jesusfilm.org/watch/jesus.html/english.html'
  )
})
