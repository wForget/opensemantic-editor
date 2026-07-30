import ValidatedInput from './ValidatedInput.jsx';
import ValidatedTextarea from './ValidatedTextarea.jsx';
import ExpressionEditor from './ExpressionEditor.jsx';
import AIContextEditor from './AIContextEditor.jsx';

const MetricEditorFields = ({
    metric,
    metricPath,
    setValue,
    namePrefix = 'metric',
}) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <ValidatedInput
                name={`${namePrefix}-name`}
                label="Name"
                value={metric.name || ''}
                onChange={(e) => setValue(`${metricPath}.name`, e.target.value)}
                required={true}
                placeholder="metric_name"
            />
            <div className="sm:col-span-2">
                <ValidatedTextarea
                    name={`${namePrefix}-desc`}
                    label="Description"
                    value={metric.description || ''}
                    onChange={(e) => setValue(`${metricPath}.description`, e.target.value || undefined)}
                    placeholder="Describe the metric..."
                    rows={2}
                />
            </div>
            <div className="sm:col-span-2">
                <ExpressionEditor
                    label="Expression"
                    value={metric.expression}
                    onChange={(val) => setValue(`${metricPath}.expression`, val)}
                />
            </div>
        </div>

        <AIContextEditor
            label="AI Context"
            value={metric.ai_context || {}}
            onChange={(val) => setValue(`${metricPath}.ai_context`, val)}
        />
    </div>
);

export default MetricEditorFields;
