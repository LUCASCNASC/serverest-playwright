import fs from 'node:fs';

const resultsPath = 'test-results/playwright-results.json';
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

if (!summaryPath || !fs.existsSync(resultsPath)) {
  process.exit(0);
}

const report = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
const rows = [];

function collectSpecs(suite, parents = []) {
  const currentParents = suite.title ? [...parents, suite.title] : parents;

  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      let status;
      if (test.status === 'expected' && test.expectedStatus === 'failed') {
        status = 'expectedFailure';
      } else if (test.status === 'expected' && test.expectedStatus === 'passed') {
        status = 'passed';
      } else if (test.status === 'unexpected') {
        status = 'failed';
      } else if (test.status === 'flaky' || test.status === 'skipped') {
        status = test.status;
      } else {
        throw new Error(`Unknown Playwright test status: ${test.status} (${test.expectedStatus})`);
      }

      rows.push({
        title: [...currentParents, spec.title].join(' > '),
        status,
      });
    }
  }

  for (const child of suite.suites ?? []) {
    collectSpecs(child, currentParents);
  }
}

for (const suite of report.suites ?? []) {
  collectSpecs(suite);
}

const counts = rows.reduce((summary, row) => {
  summary[row.status] += 1;
  return summary;
}, { passed: 0, expectedFailure: 0, failed: 0, skipped: 0, flaky: 0 });

const lines = [
  '# Playwright Test Report',
  '',
  `| Total | Passed | Expected failures | Flaky | Failed | Skipped |`,
  `| ---: | ---: | ---: | ---: | ---: | ---: |`,
  `| ${rows.length} | ${counts.passed} | ${counts.expectedFailure} | ${counts.flaky} | ${counts.failed} | ${counts.skipped} |`,
  '',
  '## Scenarios',
  '',
  '| Scenario | Status |',
  '| --- | --- |',
  ...rows.map((row) => `| ${row.title.replaceAll('|', '\\|')} | ${row.status === 'expectedFailure' ? 'expected failure' : row.status} |`),
  '',
  'HTML and JUnit reports are available in the workflow artifacts.',
];

fs.appendFileSync(summaryPath, `${lines.join('\n')}\n`);
