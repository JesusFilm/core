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
  thumbnailLink: string
}

@Injectable()
export class GoogleDriveService {
  rootUrl: string
  constructor() {
    this.rootUrl = 'https://www.googleapis.com/drive/v3'
  }

  async getFile(req: FileRequest): Promise<FileResponse> {
    const response = await fetch(
      `${this.rootUrl}/files/${req.fileId}?fields=id,thumbnailLink,name,mimeType,kind`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${req.accessToken}`
        }
      }
    )

    return await response.json()
  }

  async setFilePermission(req: {
    fileId: string
    accessToken: string
  }): Promise<void> {
    await fetch(`${this.rootUrl}/files/${req.fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${req.accessToken}`
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    })
  }

  getFileUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`
  }
}
