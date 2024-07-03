import { createWriteStream, existsSync, mkdirSync } from "fs";
import path from "path";

import { Injectable } from "@nestjs/common/decorators/core";
import { v4 as uuidv4 } from "uuid";

import * as https from "https";
import * as http from "http";

interface DownloadFileOptions {
  fileUrl: string;
  progressCallback?: (progress: number) => Promise<void>;
}

@Injectable()
export class FileService {
  private async executeCallback(
    progressCallback:
      | ((percentage: number) => Promise<void>)
      | null
      | undefined,
    progress: number
  ): Promise<void> {
    if (progressCallback != null) {
      await progressCallback(progress);
    }
  }

  generateGoogleDriveDirectLink(shareUrl: string): string {
    const fileIdMatch = shareUrl.match(/\/file\/d\/([^\/]+)\//);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
    }
    throw new Error("Invalid Google Drive share URL");
  }

  getFileNameFromContentDisposition(
    contentDisposition: string | undefined
  ): string | null {
    if (!contentDisposition) return null;
    const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
    return fileNameMatch ? fileNameMatch[1] : null;
  }

  // async downloadFile({
  //   fileUrl,
  //   progressCallback,
  // }: DownloadFileOptions): Promise<string> {
  //   try {
  //     const isGoogleDrive = fileUrl.includes("drive.google.com");
  //     const directFileUrl = isGoogleDrive
  //       ? this.generateGoogleDriveDirectLink(fileUrl)
  //       : fileUrl;
  //     const protocol = directFileUrl.startsWith("https") ? https : http;

  //     console.log("Direct file URL:", directFileUrl);

  //     return new Promise((resolve, reject) => {
  //       const handleResponse = (response: any) => {
  //         if (
  //           response.statusCode >= 300 &&
  //           response.statusCode < 400 &&
  //           response.headers.location
  //         ) {
  //           console.log(`Redirecting to ${response.headers.location}`);
  //           const redirectUrl = new URL(
  //             response.headers.location,
  //             directFileUrl
  //           ).toString();
  //           protocol.get(redirectUrl, handleResponse).on("error", reject);
  //           return;
  //         }

  //         if (response.statusCode !== 200) {
  //           return reject(
  //             new Error(
  //               `Failed to get '${directFileUrl}' (${response.statusCode})`
  //             )
  //           );
  //         }

  //         const totalLength = parseInt(
  //           response.headers["content-length"] ?? "0",
  //           10
  //         );
  //         let downloadedLength = 0;

  //         const downloadDirectory = path.join(__dirname, "..", "downloads");
  //         if (!existsSync(downloadDirectory)) {
  //           mkdirSync(downloadDirectory, { recursive: true });
  //           console.log("Created download directory:", downloadDirectory);
  //         }

  //         let fileName = this.getFileNameFromContentDisposition(
  //           response.headers["content-disposition"]
  //         );
  //         if (!fileName) {
  //           fileName = uuidv4(); // Use a UUID if filename is not available
  //         }

  //         const outputPath = path.join(downloadDirectory, fileName);
  //         const writer = createWriteStream(outputPath);

  //         response.pipe(writer);

  //         response.on("data", (chunk: Buffer) => {
  //           downloadedLength += chunk.length;
  //           const percentage = totalLength
  //             ? (downloadedLength / totalLength) * 100
  //             : 0;
  //           if (progressCallback) {
  //             void progressCallback(percentage);
  //           }
  //         });

  //         writer.on("finish", () => {
  //           console.log("Download finished:", outputPath);
  //           resolve(outputPath);
  //         });
  //         writer.on("error", (error) => {
  //           console.error("Writer error:", error);
  //           reject(error);
  //         });
  //       };

  //       protocol.get(directFileUrl, handleResponse).on("error", (error) => {
  //         console.error("Protocol error:", error);
  //         reject(error);
  //       });
  //     });
  //   } catch (error) {
  //     console.error("Download file error:", error);
  //     throw error;
  //   }
  // }

  async downloadFile({
    fileUrl,
    progressCallback,
  }: DownloadFileOptions): Promise<string> {
    try {
      const isGoogleDrive = fileUrl.includes("drive.google.com");
      const directFileUrl = isGoogleDrive
        ? this.generateGoogleDriveDirectLink(fileUrl)
        : fileUrl;
      const protocol = directFileUrl.startsWith("https") ? https : http;

      console.log("Direct file URL:", directFileUrl);

      return new Promise((resolve, reject) => {
        const handleResponse = (response: any) => {
          if (
            response.statusCode >= 300 &&
            response.statusCode < 400 &&
            response.headers.location
          ) {
            console.log(`Redirecting to ${response.headers.location}`);
            const redirectUrl = new URL(
              response.headers.location,
              directFileUrl
            ).toString();
            protocol.get(redirectUrl, handleResponse).on("error", reject);
            return;
          }

          if (response.statusCode !== 200) {
            return reject(
              new Error(
                `Failed to get '${directFileUrl}' (${response.statusCode})`
              )
            );
          }

          const totalLength = parseInt(
            response.headers["content-length"] ?? "0",
            10
          );
          let downloadedLength = 0;

          const downloadDirectory = path.join(__dirname, "..", "downloads");
          if (!existsSync(downloadDirectory)) {
            mkdirSync(downloadDirectory, { recursive: true });
            console.log("Created download directory:", downloadDirectory);
          }

          let fileName = this.getFileNameFromContentDisposition(
            response.headers["content-disposition"]
          );
          if (!fileName) {
            fileName = uuidv4();
          }

          const outputPath = path.join(downloadDirectory, fileName);
          const writer = createWriteStream(outputPath);

          response.pipe(writer);

          response.on("data", (chunk: Buffer) => {
            downloadedLength += chunk.length;
            const percentage = totalLength
              ? (downloadedLength / totalLength) * 100
              : 0;
            this.executeCallback(progressCallback, percentage);
          });

          writer.on("finish", () => {
            console.log("Download finished:", outputPath);
            resolve(outputPath);
          });
          writer.on("error", (error) => {
            console.error("Writer error:", error);
            reject(error);
          });
        };

        protocol.get(directFileUrl, handleResponse).on("error", (error) => {
          console.error("Protocol error:", error);
          reject(error);
        });
      });
    } catch (error) {
      console.error("Download file error:", error);
      throw error;
    }
  }
}
