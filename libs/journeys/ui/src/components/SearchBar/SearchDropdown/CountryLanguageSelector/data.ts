interface JsonReturn {
  country: string
}

interface FetchReturn {
  json: () => Promise<JsonReturn>
}

export async function fetchCountryMock(): Promise<FetchReturn> {
  return await Promise.resolve({
    json: async () => await Promise.resolve({ country: 'US' })
  })
}
