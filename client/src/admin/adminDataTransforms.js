// Pure transformations of server-supplied summaries. No embedded study or preview observations.
const CONDITIONS = ["TE", "CS", "SE", "BL"];

export function buildAcademicDataFromSummary(summary) {
  const metrics = summary?.metrics || {};
  const conditionObservations = metricName => CONDITIONS.map(condition => metrics[metricName]?.[condition]?.observations || []);
  const toRows = series => {
    const length = Math.max(0, ...series.map(values => values.length));
    return Array.from({ length }, (_, rowIndex) => CONDITIONS.map((_, conditionIndex) => series[conditionIndex][rowIndex] ?? null));
  };
  const taskNames = ["ACA", "CTIA", "CLA"];
  const taskAccuracy = {
    "Article Comprehension": toRows(conditionObservations("ACA")),
    "Comment-Linked Comprehension": toRows(conditionObservations("CTIA")),
    "Comment Location": toRows(conditionObservations("CLA"))
  };
  const accuracySeries = CONDITIONS.map(condition => {
    const taskSeries = taskNames.map(metricName => metrics[metricName]?.[condition]?.observations || []);
    const length = Math.max(0, ...taskSeries.map(values => values.length));
    return Array.from({ length }, (_, rowIndex) => {
      const values = taskSeries.map(values => values[rowIndex]).filter(value => value != null).map(Number);
      return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    });
  });
  return {
    overallTime: toRows(conditionObservations("Initial Reading Time")),
    overallAccuracy: toRows(accuracySeries),
    taskAccuracy
  };
}

export function buildMetricSeriesFromSummary(summary, metricName) {
  const metrics = summary?.metrics || {};
  return Object.fromEntries(CONDITIONS.map(condition => [condition, metrics[metricName]?.[condition] || { observations: [] }]));
}

export function buildPreferenceSeriesFromSummary(summary) {
  const preference = summary?.preference || {};
  const rank = Object.fromEntries(CONDITIONS.map(condition => [condition, preference.rank?.[condition] || { observations: [] }]));
  const submitted = Number(preference.submitted || 0);
  const firstPlaceShare = Object.fromEntries(CONDITIONS.map(condition => [condition, {
    observations: submitted ? [Number(preference.rank_one?.[condition] || 0) / submitted] : []
  }]));
  return { meanRank: rank, firstPlaceShare };
}
