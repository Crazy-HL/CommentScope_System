const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
(async () => {
  assert.equal(fs.existsSync(path.join(root,'src/admin/adminDemoData.js')),false,'Release must not include generated demo observations');
  for (const p of ['src/components/admin/AdminDashboard.vue','src/components/admin/AdminOverview.vue']) {
    assert.doesNotMatch(read(p),/showDemoData|DEMO_|adminDemoData|模拟数据/);
  }
  assert.doesNotMatch(read('src/experiment/experimentConfig.js'),/P\d+\(2\)/);
  const source=read('src/admin/adminDataTransforms.js');
  const mod=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
  const empty=mod.buildAcademicDataFromSummary(null);
  assert.deepEqual(empty.overallTime,[]);
  assert.deepEqual(empty.overallAccuracy,[]);
  for(const rows of Object.values(empty.taskAccuracy)) assert.deepEqual(rows,[]);
  for(const series of Object.values(mod.buildMetricSeriesFromSummary(null,'ACA'))) assert.deepEqual(series.observations,[]);
  for(const kind of Object.values(mod.buildPreferenceSeriesFromSummary(null)))
    for(const series of Object.values(kind)) assert.deepEqual(series.observations,[]);
  // Synthetic, minimal software-test inputs, NOT empirical study observations.
  const supplied={metrics:{ACA:{TE:{observations:[0.5]}},'Initial Reading Time':{TE:{observations:[100]}}},preference:{submitted:2,rank_one:{TE:1}}};
  assert.deepEqual(mod.buildAcademicDataFromSummary(supplied).overallTime,[[100,null,null,null]]);
  assert.deepEqual(mod.buildAcademicDataFromSummary(supplied).taskAccuracy['Article Comprehension'],[[0.5,null,null,null]]);
  assert.deepEqual(mod.buildMetricSeriesFromSummary(supplied,'ACA').TE,{observations:[0.5]});
  assert.deepEqual(mod.buildPreferenceSeriesFromSummary(supplied).firstPlaceShare.TE.observations,[0.5]);
  console.log('Public release: no demo data; empty and supplied summaries verified.');
})().catch(error=>{console.error(error);process.exitCode=1;});
