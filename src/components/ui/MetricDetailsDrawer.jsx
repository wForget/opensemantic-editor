import { useCallback, useEffect, useRef, useState } from 'react';
import MetricEditorFields from './MetricEditorFields.jsx';

const MIN_WIDTH = 280;
const MAX_WIDTH_PERCENT = 0.8;

const MetricDetailsDrawer = ({
    metric,
    metricPath,
    setValue,
    open,
    onClose,
    onDelete,
}) => {
    const [width, setWidth] = useState(null);
    const [isResizing, setIsResizing] = useState(false);
    const drawerRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        previousFocusRef.current = document.activeElement;
        const focusTimer = setTimeout(() => {
            drawerRef.current?.querySelector('input, textarea, select, button')?.focus();
        }, 0);

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
                return;
            }
            if (event.key !== 'Tab' || !drawerRef.current) return;

            const focusable = Array.from(drawerRef.current.querySelectorAll(
                'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]'
            ));
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            clearTimeout(focusTimer);
            document.removeEventListener('keydown', handleKeyDown);
            previousFocusRef.current?.focus?.();
        };
    }, [open, onClose]);

    const handleMouseDown = useCallback((event) => {
        event.preventDefault();
        setIsResizing(true);
    }, []);

    const handleMouseMove = useCallback((event) => {
        if (!isResizing) return;
        const newWidth = window.innerWidth - event.clientX;
        const maxWidth = window.innerWidth * MAX_WIDTH_PERCENT;
        setWidth(Math.min(Math.max(newWidth, MIN_WIDTH), maxWidth));
    }, [isResizing]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    const handleResizeKeyDown = useCallback((event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const currentWidth = width || drawerRef.current?.getBoundingClientRect().width || MIN_WIDTH;
        const delta = event.key === 'ArrowLeft' ? 20 : -20;
        const maxWidth = window.innerWidth * MAX_WIDTH_PERCENT;
        setWidth(Math.min(Math.max(currentWidth + delta, MIN_WIDTH), maxWidth));
    }, [width]);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    if (!metric) {
        return <div ref={drawerRef} className="hidden" />;
    }

    return (
        <aside
            ref={drawerRef}
            style={width ? { width: `${width}px` } : undefined}
            className={`fixed inset-y-0 right-0 z-40 ${
                width ? '' : 'w-screen max-w-[calc(100vw-3rem)] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg'
            } transform transition-transform ${isResizing ? '' : 'duration-300'} ease-in-out ${
                open ? 'translate-x-0' : 'translate-x-full'
            }`}
            aria-label={`Edit Metric: ${metric.name || 'Unnamed metric'}`}
            role="dialog"
            aria-modal="true"
        >
            <div
                onMouseDown={handleMouseDown}
                onKeyDown={handleResizeKeyDown}
                className="absolute bottom-0 left-0 top-0 z-10 w-1 cursor-ew-resize transition-colors hover:bg-emerald-500/50 active:bg-emerald-500"
                title="Drag to resize"
                role="separator"
                aria-label="Resize metric editor"
                aria-orientation="vertical"
                tabIndex={0}
            />

            <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                <div className="border-b border-gray-200 bg-gray-50 px-3 py-3">
                    <div className="flex items-start justify-between">
                        <h2 className="truncate text-sm font-semibold text-gray-900">
                            {metric.name ? `Edit Metric: ${metric.name}` : 'Edit Metric'}
                        </h2>
                        <div className="ml-2 flex h-6 items-center gap-1">
                            <button
                                type="button"
                                onClick={onDelete}
                                className="relative rounded-md bg-gray-50 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                title="Delete metric"
                            >
                                <span className="sr-only">Delete metric</span>
                                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="relative rounded-md bg-gray-50 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                            >
                                <span className="sr-only">Close metric editor</span>
                                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18" strokeWidth="2" />
                                    <path d="m6 6 12 12" strokeWidth="2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative flex-1 overflow-y-auto px-3 py-3">
                    <MetricEditorFields
                        key={metricPath}
                        metric={metric}
                        metricPath={metricPath}
                        setValue={setValue}
                        namePrefix="drawer-metric"
                    />
                </div>
            </div>
        </aside>
    );
};

export default MetricDetailsDrawer;
