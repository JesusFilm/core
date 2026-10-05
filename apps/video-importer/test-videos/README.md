# Video Importer Test Fixtures

This folder is for local/manual importer sanity runs. The media files are intentionally gitignored so the repo does not carry large binary fixtures or accidentally commit `.completed` run output.

## Reset / Generate Local Fixtures

Place a small local source MP4 in this folder named `6672301-uhd_3840_2160_24fps.mp4`, or pass another source MP4 path:

```sh
./reset-fixtures.sh
./reset-fixtures.sh /path/to/source.mp4
```

The script restores `.completed` files back to runnable names when present and creates any missing generated fixtures from the source MP4. It also recreates the intentionally invalid MP4 and subtitle fixtures. If the source MP4 has no audio stream, the AAC fixture is generated from a short sine tone so audio metadata tests remain deterministic.

## Generated Fixture Names

- `0_JesusVisionJohn---base---3934---1.mp4` - normal video import filename.
- `0_JesusVisionJohn---base---3934---1---496---2.mp4` - burned-in video import filename with audio language/version plus burned-in language/version.
- `0_JesusVisionJohn---base---   ---1.mp4` - video import filename with a blank language segment after trimming.
- `missing_0_JesusVisionJohn---base---3934---1.mp4` - video import filename for the no-video-found validation path.
- `0_JesusVisionJohn---base---3934---999.mp4` - intentionally invalid MP4 bytes; should fail metadata extraction before R2 asset creation.
- `0_JesusVisionJohn---base---3934.srt` - subtitle import filename.
- `0_JesusVisionJohn---base---3934.vtt` - WebVTT subtitle import filename.
- `3934.aac` - audio preview import filename.

Use `--dry-run` for fixture discovery unless you intentionally want to test real uploads and GraphQL mutations.
