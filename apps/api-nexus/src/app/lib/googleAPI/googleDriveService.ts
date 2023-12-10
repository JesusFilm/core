import { Injectable } from '@nestjs/common/decorators/core'

interface FileRequest {
  fileId: string
  accessToken: string
}

interface FileResponse {
  kind: string
  id: string
  name: string
  mimeType: string
}

@Injectable()
export class GoogleDriveService {
  rootUrl: string
  constructor() {
    this.rootUrl = 'https://www.googleapis.com/drive/v3'
  }

  async getFile(req: FileRequest): Promise<FileResponse> {
    const response = await fetch(`${this.rootUrl}/files/${req.fileId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${req.accessToken}`
      }
    })

    return await response.json()
  }
}
