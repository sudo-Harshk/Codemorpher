// generate-report.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const now = new Date();
const timestamp = now
  .toISOString()
  .replace(/[-:]/g, '')
  .replace(/\..+/, '')
  .replace('T', '-');

const reportDir = path.join('cypress', 'reports', 'html', timestamp);
fs.mkdirSync(reportDir, { recursive: true });

execSync(`npx marge mochawesome.json --reportDir "${reportDir}" --reportFilename mochawesome --inline`, {
  stdio: 'inherit',
});

console.log(`\n✓ Report generated at: ${reportDir}/mochawesome.html`);
