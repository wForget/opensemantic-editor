import { useEffect, useMemo, useState } from 'react';
import ValidatedInput from './ValidatedInput.jsx';
import AIContextEditor from './AIContextEditor.jsx';

const getColumnPairs = (relationship) => {
    const fromColumns = relationship.from_columns || [];
    const toColumns = relationship.to_columns || [];
    const pairCount = Math.max(fromColumns.length, toColumns.length);

    return Array.from({ length: pairCount }, (_, index) => ({
        from: fromColumns[index] || '',
        to: toColumns[index] || '',
    }));
};

const ColumnSelect = ({ id, label, value, options, onChange }) => {
    const hasUnavailableValue = value && !options.includes(value);

    return (
        <div className="min-w-0 flex-1">
            <label htmlFor={id} className="mb-1 block text-xs font-medium leading-4 text-gray-900">
                {label}
            </label>
            <select
                id={id}
                name={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="block w-full rounded-md border-0 bg-white py-1.5 pl-2 pr-8 text-xs leading-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            >
                <option value="">Select column...</option>
                {hasUnavailableValue && (
                    <option value={value}>{value} (unavailable)</option>
                )}
                {options.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
        </div>
    );
};

const RelationshipEditorFields = ({
    relationship,
    relationshipPath,
    datasets,
    setValue,
    namePrefix = 'rel',
}) => {
    const datasetNames = datasets.map(dataset => dataset?.name).filter(Boolean);
    const fromDataset = datasets.find(dataset => dataset?.name === relationship.from);
    const toDataset = datasets.find(dataset => dataset?.name === relationship.to);
    const fromFieldNames = (fromDataset?.fields || []).map(field => field?.name).filter(Boolean);
    const toFieldNames = (toDataset?.fields || []).map(field => field?.name).filter(Boolean);
    const columnPairs = useMemo(
        () => getColumnPairs(relationship),
        [relationship]
    );
    const [newFromColumn, setNewFromColumn] = useState('');
    const [newToColumn, setNewToColumn] = useState('');

    useEffect(() => {
        setNewFromColumn('');
        setNewToColumn('');
    }, [relationshipPath, relationship.from, relationship.to]);

    const setRelationship = (updates) => {
        setValue(relationshipPath, {
            ...relationship,
            ...updates,
        });
    };

    const setColumnPairs = (pairs) => {
        setRelationship({
            from_columns: pairs.length ? pairs.map(pair => pair.from) : undefined,
            to_columns: pairs.length ? pairs.map(pair => pair.to) : undefined,
        });
    };

    const handleDatasetChange = (property, value) => {
        setRelationship({
            [property]: value,
            from_columns: undefined,
            to_columns: undefined,
        });
    };

    const handlePairChange = (index, property, value) => {
        const updatedPairs = columnPairs.map((pair, pairIndex) => (
            pairIndex === index ? { ...pair, [property]: value } : pair
        ));
        setColumnPairs(updatedPairs);
    };

    const handleRemovePair = (index) => {
        setColumnPairs(columnPairs.filter((_, pairIndex) => pairIndex !== index));
    };

    const handleAddPair = () => {
        if (!newFromColumn || !newToColumn) return;
        setColumnPairs([
            ...columnPairs,
            { from: newFromColumn, to: newToColumn },
        ]);
        setNewFromColumn('');
        setNewToColumn('');
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <ValidatedInput
                    name={`${namePrefix}-name`}
                    label="Name"
                    value={relationship.name || ''}
                    onChange={(event) => setValue(`${relationshipPath}.name`, event.target.value)}
                    required={true}
                    placeholder="relationship_name"
                />
                <div>{/* spacer */}</div>
                <div>
                    <label
                        htmlFor={`${namePrefix}-from`}
                        className="mb-1 block text-xs font-medium leading-4 text-gray-900"
                    >
                        From Dataset
                    </label>
                    <select
                        id={`${namePrefix}-from`}
                        name={`${namePrefix}-from`}
                        value={relationship.from || ''}
                        onChange={(event) => handleDatasetChange('from', event.target.value)}
                        className="block w-full rounded-md border-0 bg-white py-1.5 pl-2 pr-8 text-xs leading-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    >
                        <option value="">Select dataset...</option>
                        {datasetNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
                <div>
                    <label
                        htmlFor={`${namePrefix}-to`}
                        className="mb-1 block text-xs font-medium leading-4 text-gray-900"
                    >
                        To Dataset
                    </label>
                    <select
                        id={`${namePrefix}-to`}
                        name={`${namePrefix}-to`}
                        value={relationship.to || ''}
                        onChange={(event) => handleDatasetChange('to', event.target.value)}
                        className="block w-full rounded-md border-0 bg-white py-1.5 pl-2 pr-8 text-xs leading-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    >
                        <option value="">Select dataset...</option>
                        {datasetNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                    <div className="text-xs font-medium leading-4 text-gray-900">Column Pairs</div>
                    {columnPairs.length === 0 ? (
                        <p className="text-xs text-gray-400">No column pairs. The relationship will connect the datasets directly.</p>
                    ) : (
                        <div className="space-y-2">
                            {columnPairs.map((pair, index) => (
                                <div
                                    key={index}
                                    className="rounded-md border border-gray-200 bg-gray-50 p-2"
                                >
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-600">Pair {index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePair(index)}
                                            className="text-xs text-red-600 hover:text-red-700"
                                            aria-label={`Remove column pair ${index + 1}`}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <ColumnSelect
                                            id={`${namePrefix}-pair-${index}-from`}
                                            label="From Column"
                                            value={pair.from}
                                            options={fromFieldNames}
                                            onChange={(value) => handlePairChange(index, 'from', value)}
                                        />
                                        <ColumnSelect
                                            id={`${namePrefix}-pair-${index}-to`}
                                            label="To Column"
                                            value={pair.to}
                                            options={toFieldNames}
                                            onChange={(value) => handlePairChange(index, 'to', value)}
                                        />
                                    </div>
                                    {(!pair.from || !pair.to) && (
                                        <p className="mt-1 text-xs text-amber-700">Select both columns to complete this pair.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="rounded-md border border-dashed border-gray-300 p-2">
                        <div className="mb-2 text-xs font-medium text-gray-600">Add Column Pair</div>
                        <div className="flex items-end gap-2">
                            <ColumnSelect
                                id={`${namePrefix}-new-pair-from`}
                                label="From Column"
                                value={newFromColumn}
                                options={fromFieldNames}
                                onChange={setNewFromColumn}
                            />
                            <ColumnSelect
                                id={`${namePrefix}-new-pair-to`}
                                label="To Column"
                                value={newToColumn}
                                options={toFieldNames}
                                onChange={setNewToColumn}
                            />
                            <button
                                type="button"
                                onClick={handleAddPair}
                                disabled={!newFromColumn || !newToColumn}
                                className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:bg-gray-300"
                            >
                                Add Pair
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AIContextEditor
                label="AI Context"
                value={relationship.ai_context || {}}
                onChange={(value) => setValue(`${relationshipPath}.ai_context`, value)}
            />
        </div>
    );
};

export default RelationshipEditorFields;
