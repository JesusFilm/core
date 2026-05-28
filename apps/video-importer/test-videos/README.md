# Video Importer Test Fixtures

This folder is for local/manual importer sanity runs. The media files are intentionally gitignored so the repo does not carry large binary fixtures or accidentally commit `.completed` run output.

## Reset / Generate Local Fixtures

Place a small local source MP4 in this folder named `Big_Buck_Bunny_1080_10s_5MB.mp4`, or pass another source MP4 path:

```sh
./reset-fixtures.sh
./reset-fixtures.sh /path/to/source.mp4
```

The script restores `.completed` files back to runnable names when present and creates any missing generated fixtures from the source MP4. It also recreates the intentionally invalid MP4 and subtitle fixture.

## Generated Fixture Names

- `0_JesusVisionJohn---base---3934---1.mp4` - normal video import filename.
- `0_JesusVisionJohn---base---3934---1---496---2.mp4` - burned-in video import filename with audio language/version plus burned-in language/version.
- `0_JesusVisionJohn---base---   ---1.mp4` - video import filename with a blank language segment after trimming.
- `missing_0_JesusVisionJohn---base---3934---1.mp4` - video import filename for the no-video-found validation path.
- `0_JesusVisionJohn---base---3934---999.mp4` - intentionally invalid MP4 bytes; should fail metadata extraction before R2 asset creation.
- `0_JesusVisionJohn---base---3934.srt` - subtitle import filename.

No audio preview fixture is generated because real AAC imports update shared language-level data.

Use `--dry-run` for fixture discovery unless you intentionally want to test real uploads and GraphQL mutations.
