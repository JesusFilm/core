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

3. **Troubleshoot as Necessary**
   - Review the output in your terminal for any errors or warnings.
   - Common issues:
     - Incorrect file naming or unsupported file types/extensions
     - Missing required environment variables (see below)
     - Network or authentication errors
   - Fix any issues and re-run the executable as needed.

## Example Usage

```sh
./video-importer --folder ./import-files
```

```sh
./video-importer --dry-run
```

---

## Support

For help, contact the Jesus Film Media engineering team.
