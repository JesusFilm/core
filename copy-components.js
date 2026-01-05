const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const basePath = 'apps/journeys-admin/src/components/Editor';
const sourceBase = path.join(basePath, 'Slider');
const destBase = path.join(basePath, 'LayeredView');

// Copy Content subdirectories
copyRecursiveSync(
  path.join(sourceBase, 'Content', 'Canvas'),
  path.join(destBase, 'Content', 'Canvas')
);
copyRecursiveSync(
  path.join(sourceBase, 'Content', 'Goals'),
  path.join(destBase, 'Content', 'Goals')
);
copyRecursiveSync(
  path.join(sourceBase, 'Content', 'Social'),
  path.join(destBase, 'Content', 'Social')
);

// Copy JourneyFlow subdirectories
const journeyFlowDirs = [
  'nodes',
  'AnalyticsDataPoint',
  'AnalyticsOverlaySwitch',
  'JourneyAnalyticsCard',
  'NewStepButton',
  'utils',
  'libs',
  'Controls',
  'edges'
];

journeyFlowDirs.forEach(dir => {
  copyRecursiveSync(
    path.join(sourceBase, 'JourneyFlow', dir),
    path.join(destBase, 'JourneyFlow', dir)
  );
});

// Copy Settings subdirectories
const settingsDirs = [
  'GoalDetails',
  'SocialDetails',
  'Drawer',
  'CanvasDetails'
];

settingsDirs.forEach(dir => {
  copyRecursiveSync(
    path.join(sourceBase, 'Settings', dir),
    path.join(destBase, 'Settings', dir)
  );
});

console.log('All components copied successfully!');

