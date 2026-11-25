import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

test('reports expected failures separately from unexpected results', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'playwright-summary-'));
  const script = fileURLToPath(new URL('./generate-github-summary.mjs', import.meta.url));
  const summary = path.join(directory, 'summary.md');
  const cases = [
    { title: 'pass', status: 'expected', expectedStatus: 'passed' },
    { title: 'known defect', status: 'expected', expectedStatus: 'failed' },
    { title: 'unexpected pass', status: 'unexpected', expectedStatus: 'failed' },
    { title: 'failure', status: 'unexpected', expectedStatus: 'passed' },
    { title: 'flaky', status: 'flaky', expectedStatus: 'passed' },
    { title: 'skipped', status: 'skipped', expectedStatus: 'skipped' },
  ];

  try {
    fs.mkdirSync(path.join(directory, 'test-results'));
    fs.writeFileSync(
      path.join(directory, 'test-results', 'playwright-results.json'),
      JSON.stringify({
        suites: [{
          title: 'suite',
          specs: cases.map(({ title, ...testCase }) => ({ title, tests: [testCase] })),
        }],
      }),
    );
    execFileSync(process.execPath, [script], {
      cwd: directory,
      env: { ...process.env, GITHUB_STEP_SUMMARY: summary },
    });

    const report = fs.readFileSync(summary, 'utf8');
    assert.match(report, /\| 6 \| 1 \| 1 \| 1 \| 2 \| 1 \|/);
    assert.match(report, /\| suite > known defect \| expected failure \|/);
    assert.match(report, /\| suite > unexpected pass \| failed \|/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
