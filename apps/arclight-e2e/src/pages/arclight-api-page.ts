import axios, { AxiosResponse } from 'axios'

export class ArclightApiPage {
  constructor(private readonly baseUrl: string) {}

  async getMediaComponents(): Promise<AxiosResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/media-components`)
      return response
    } catch (error) {
      console.error('Error fetching media components:', error)
      throw error
    }
  }
}
