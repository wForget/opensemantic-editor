import { memo } from 'react';

const getMetricExpressions = (metric) => (
  metric?.expression?.dialects?.filter((entry) => entry?.expression) || []
);

const MetricNode = ({ data }) => {
  const metricEntries = data.metricEntries || [];

  return (
    <section
      className="min-w-[300px] max-w-[360px]"
      data-testid="metrics-node"
      aria-label={`Metrics (${metricEntries.length})`}
    >
      <div className="h-1.5 rounded-t bg-emerald-600" />
      <div className="overflow-hidden rounded-b border-[3px] border-solid border-[#E9EEF4]">
        <div className="flex items-center gap-2 bg-[#E9EEF4] px-2 py-1.5">
          <svg
            className="h-4 w-4 flex-shrink-0 text-emerald-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V9m5 10V5m5 14v-7m5 7V3" />
          </svg>
          <span className="flex-1 font-bold text-md text-gray-900">Metrics</span>
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            {metricEntries.length}
          </span>
        </div>

        <div className="nodrag nowheel max-h-[480px] divide-y divide-[#E9EEF4] overflow-y-auto bg-white">
          {metricEntries.map(({ metric, index }) => {
            const expressions = getMetricExpressions(metric);
            const expression = expressions[0];
            const metricName = metric.name || 'Unnamed metric';
            const details = [
              metricName,
              ...expressions.map((entry) => (
                `${entry.dialect ? `${entry.dialect}: ` : ''}${entry.expression}`
              )),
              metric.description,
            ].filter(Boolean).join('\n');

            return (
              <button
                type="button"
                key={`${metric.name || 'metric'}-${index}`}
                className="block w-full cursor-pointer px-3 py-2 text-left outline-none hover:bg-emerald-50 focus:bg-emerald-50 focus:ring-2 focus:ring-inset focus:ring-emerald-500"
                title={details || metricName}
                aria-label={details || metricName}
                data-testid={`metric-row-${index}`}
                onClick={(event) => {
                  event.stopPropagation();
                  data.onOpenMetric?.(index);
                }}
              >
                <div className={`truncate text-sm font-medium ${
                  metric.name ? 'text-gray-900' : 'italic text-gray-400'
                }`}>
                  {metricName}
                </div>
                {expression?.expression && (
                  <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                    {expression.dialect && (
                      <span className="flex-shrink-0 rounded bg-emerald-50 px-1 py-0.5 font-mono text-[9px] font-semibold text-emerald-700">
                        {expression.dialect}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-gray-500">
                      {expression.expression}
                    </span>
                    {expressions.length > 1 && (
                      <span
                        className="flex-shrink-0 text-[9px] font-medium text-gray-500"
                        aria-label={`${expressions.length} dialect expressions`}
                      >
                        +{expressions.length - 1}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default memo(MetricNode);
