# Video Importer Executable (Packaged Binary)

## Overview

The Video Importer packaged binary is a command-line tool for batch importing video files, subtitles, and audio previews into the Jesus Film Media platform. It uploads assets to Cloudflare R2, creates Mux video assets, and updates the backend via GraphQL. This tool is designed for non-developers and requires no Node.js or npm setup—just run the binary!

---

## Requirements

Before you can use the Video Importer binary, make sure you have the following:

### 1. .env File (Environment Variables)

- You will be given a .env file with the exectuable. It must be kept in the same dir as the tool.

### 2. ffprobe (and ffmpeg)

- The tool requires `ffprobe` (and optionally `ffmpeg`) to be installed and available in your system's PATH.
- **How to check:**
  - Run `ffprobe -version` in your terminal. If you see version info, it's installed.
- **How to install:**
  - On Mac: `brew install ffmpeg`
  - On Ubuntu/Debian: `sudo apt-get install ffmpeg`
  - On Windows: [Download from ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH.

### 3. Operating System

- The binary is available for Linux, macOS, and Windows. Make sure you have the correct version for your OS.

### 4. Network Access

- The tool needs to connect to the internet to upload files and update backend records. Ensure your network/firewall allows outgoing connections to the endpoints specified in your `.env` file.

---

## Supported File Types & Formatting

### Video Files

- **Format:** `.mp4` only
- **Naming Convention:**
  ```
  <videoId>---<edition>---<languageId>[---extra].mp4
  ```
  - Example: `1_jf-0-0---ot---529.mp4`
  - Example: `1_jf-0-0---jl---496---VersionNumber.mp4`

### Subtitle Files

- **Formats:** `.srt` or `.vtt` only
- **Naming Convention:**
  ```
  <videoId>---<edition>---<languageId>[---extra].srt
  <videoId>---<edition>---<languageId>[---extra].vtt
  ```
  - Example: `1_jf-0-0---ot---529.srt`

### Audio Preview Files

- **Format:** `.aac` only
- **Naming Convention:**
  ```
  <languageId>.aac
  ```
  - Example: `529.aac`

---

## Typical Workflow

1. **Prepare Your Files**

   - Place all your video, subtitle, and audio preview files in a single folder.
   - Ensure all files follow the naming conventions and use the correct file extensions.

2. **Run the Executable**

   - Open a terminal in the folder containing the binary or specify the folder with your files.
   - Run the binary:
     ```sh
     ./video-importer
     ```
   - Or, to specify a folder:
     ```sh
     ./video-importer --folder /path/to/your/files
     ```
   - To do a dry run (no uploads, just see what would happen):
     ```sh
     ./video-importer --dry-run
     ```
   - To skip retrying failed files (only process new files):
     ```sh
     ./video-importer --skip-retry
     ```

3. **Troubleshoot as Necessary**
   - Review the output in your terminal for any errors or warnings.
   - Common issues:
     - Incorrect file naming or unsupported file types/extensions
     - Missing required environment variables
     - Network or authentication errors
     - Video doesn't exist in the database (see Common Issues below)
       - Fix any issues and re-run the executable as needed.

---

## File Status Tracking & Automatic Retry

The video importer automatically tracks the processing status of your files to avoid reprocessing and enable easy retries:

### File Renaming Behavior

- **Successful files** are renamed with `.completed` extension

  - `video.mp4` → `video.mp4.completed`
  - `subtitle.srt` → `subtitle.srt.completed`
  - `audio.aac` → `audio.aac.completed`

- **Failed files** are renamed with `.failed` extension
  - `video.mp4` → `video.mp4.failed`
  - `subtitle.srt` → `subtitle.srt.failed`
  - `audio.aac` → `audio.aac.failed`

### Automatic Retry Logic

- **First run**: Processes all valid files in the folder
- **Subsequent runs**:
  - ✅ Skips `.completed` files (already processed successfully)
  - 🔄 Automatically retries `.failed` files
  - 🆕 Processes any new files
- **With `--skip-retry`**: Only processes new files, ignores `.failed` files

This means you can safely re-run the importer without worrying about duplicate processing or losing track of what failed.

### Managing Failed Files

If you want to manually handle failed files:

1. **Review failures**: Check the console output for specific error messages
2. **Fix issues**: Address problems (e.g., create missing videos in database)
3. **Retry**: Run the importer again to automatically retry failed files
4. **Skip retries**: Use `--skip-retry` to only process new files

---

## Example Usage

```sh
./video-importer --folder ./import-files
```

```sh
./video-importer --dry-run
```

---

## Common Issues & Troubleshooting

### "Foreign key constraint violated" Error

**Error message:** `Foreign key constraint violated on the constraint: CloudflareR2_videoId_fkey`

**Cause:** The video with the specified ID doesn't exist in the database.

**Solution:**

1. Verify the video ID from your filename is correct
2. Ensure the video has been created in the system before importing assets
3. Contact the team to create the missing video record

**Example:**

- Filename: `1_jf6113---ot---23924.mp4`
- Video ID: `1_jf6113` ← This video must exist in the database first

### Authentication/Permission Errors

**Error message:** `User not found` or `Authorization failed`

**Cause:** Invalid credentials or insufficient permissions.

**Solution:**

1. Check that your `.env` file is in the same directory as the executable
2. Verify your authentication credentials are correct
3. Ensure your user account has "publisher" permissions

### Network/Upload Errors

**Error message:** Connection timeouts or R2 upload failures

**Cause:** Network connectivity or Cloudflare R2 configuration issues.

**Solution:**

1. Check your internet connection
2. Verify Cloudflare R2 credentials in the `.env` file
3. Ensure firewall allows outbound connections

### File Format/Naming Errors

**Error message:** `No valid files found` or processing skipped

**Cause:** Files don't match the required naming convention or format.

**Solution:**

1. Double-check file naming follows the exact pattern:
   - Videos: `<videoId>---<edition>---<languageId>.mp4`
   - Subtitles: `<videoId>---<edition>---<languageId>.(srt|vtt)`
   - Audio: `<languageId>.aac`
2. Ensure file extensions are lowercase
3. Verify no extra spaces or special characters

---

## Support

For help, contact the Jesus Film Media engineering team.
