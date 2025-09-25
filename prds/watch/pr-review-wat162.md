# PR Review Tasks for WAT-162

## Context
Tasks derived from review recommendations regarding scene detection and crop adaptation logic.

## Task List
- [x] Rework the `'transition'` branch in `adaptCropPathToSceneChange` to add transition keyframes without deleting earlier frames that remain valid for interpolation, potentially using `previousSceneChange` to scope the cleanup.
  - Preserve keyframes outside a tight transition window (and always keep the last pre-transition frame) before appending the new transition keyframe.
- [x] Thread the `autoTrackingEnabled` and `sceneChangeDetectionEnabled` flags through the detection callbacks so disabling either feature immediately halts automatic keyframe merges or adjustments.
  - Track the latest toggle values via refs and guard both the reducer merge and worker callbacks.
- [x] Update `SceneDetectionWorkerController.resumeExtraction` so it restarts the frame extraction loop after clearing the pause state (for example by rescheduling `startFrameExtraction` or triggering the throttled callback).
  - When resuming, restart the extraction loop if no timer is active and we have the necessary handles.
