"use client";

import { useLocale } from "@/components/locale-provider";
import { useState, useEffect } from "react";
import { Hammer, GripVertical } from "lucide-react";
import TasksWidget from "@/components/dashboard/tasks-widget";
import NotesWidget from "@/components/dashboard/notes-widget";
import StatsWidget from "@/components/dashboard/stats-widget";
import DetailedWeatherWidget from "@/components/dashboard/detailed-weather-widget";
import PomodoroWidget from "@/components/dashboard/pomodoro-widget";
import WaterTrackerWidget from "@/components/dashboard/water-tracker-widget";
import GitHubWidget from "@/components/dashboard/github-widget";
import WidgetSettingsModal from "@/components/dashboard/widget-settings-modal";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface WidgetPreference {
    visible: boolean;
    order: number;
}

type WidgetType = "tasks" | "notes" | "stats" | "github" | "pomodoro" | "waterTracker" | "weather";

interface SortableWidgetProps {
    id: string;
    index: number;
    children: React.ReactNode;
}

function SortableWidget({ id, index, children }: SortableWidgetProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 200ms ease',
        opacity: isDragging ? 0.4 : 1,
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative group"
        >
            {/* Drag Handle - Top Center - Subtle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing"
                title="Drag to reorder"
            >
                <div className="bg-slate-700/80 hover:bg-slate-600/90 text-slate-300 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 hover:scale-110 transition-all backdrop-blur-sm border border-slate-600/50">
                    <GripVertical className="w-4 h-4" />
                </div>
            </div>
            {children}

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}

export default function DashboardContent({ session }: { session: any }) {
    const { t, locale } = useLocale();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [widgetPreferences, setWidgetPreferences] = useState<Record<string, WidgetPreference>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [widgetOrder, setWidgetOrder] = useState<WidgetType[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const currentDate = new Date().toLocaleDateString(locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const response = await fetch("/api/widgets/preferences");
            if (response.ok) {
                const prefs = await response.json();
                setWidgetPreferences(prefs);

                const sortedWidgets = Object.entries(prefs)
                    .sort(([, a], [, b]) => (a as WidgetPreference).order - (b as WidgetPreference).order)
                    .map(([type]) => type as WidgetType);

                setWidgetOrder(sortedWidgets);
            }
        } catch (error) {
            console.error("Error fetching widget preferences:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleWidget = async (widgetType: string, visible: boolean) => {
        setWidgetPreferences(prev => ({
            ...prev,
            [widgetType]: { ...prev[widgetType], visible }
        }));

        try {
            const response = await fetch("/api/widgets/toggle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ widgetType, visible }),
            });

            if (!response.ok) {
                setWidgetPreferences(prev => ({
                    ...prev,
                    [widgetType]: { ...prev[widgetType], visible: !visible }
                }));
            }
        } catch (error) {
            console.error("Error toggling widget:", error);
            setWidgetPreferences(prev => ({
                ...prev,
                [widgetType]: { ...prev[widgetType], visible: !visible }
            }));
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: any) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setWidgetOrder((items) => {
                const oldIndex = items.indexOf(active.id as WidgetType);
                const newIndex = items.indexOf(over.id as WidgetType);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            // Save to backend
            try {
                await fetch("/api/widgets/reorder", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ widgetOrder }),
                });
            } catch (error) {
                console.error("Error saving widget order:", error);
            }
        }
    };

    const isWidgetVisible = (type: string) => {
        return widgetPreferences[type]?.visible ?? true;
    };

    const renderWidget = (type: WidgetType) => {
        const widgets: Record<WidgetType, { component: React.ReactElement }> = {
            tasks: { component: <TasksWidget /> },
            notes: { component: <NotesWidget /> },
            stats: { component: <StatsWidget /> },
            github: { component: <GitHubWidget /> },
            pomodoro: { component: <PomodoroWidget /> },
            waterTracker: { component: <WaterTrackerWidget /> },
            weather: { component: <DetailedWeatherWidget /> },
        };

        const widget = widgets[type];
        return widget ? (
            <div className="h-[500px]">
                {widget.component}
            </div>
        ) : null;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-8">
                {/* Premium Loading Animation */}
                <div className="relative">
                    {/* Outer rotating ring */}
                    <div className="w-24 h-24 rounded-full border-4 border-slate-700/30 absolute inset-0" />

                    {/* Gradient spinner */}
                    <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-purple-500 border-r-blue-500 animate-spin" />

                    {/* Inner pulsing circle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 animate-pulse" />
                    </div>

                    {/* Center dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    const visibleWidgets = widgetOrder.filter(type => isWidgetVisible(type));

    return (
        <>
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-4">
                    {session.user?.image && (
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 shadow-xl bg-slate-800 flex-shrink-0">
                            <img
                                src={session.user.image}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div>
                        <p className="text-blue-400 font-medium mb-2 uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                            {currentDate}
                        </p>
                        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            {t("dashboard.welcome")}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{session.user?.name || t("common.user")}</span>
                        </h1>
                        <p className="text-slate-400 mt-2 text-lg">{t("dashboard.subtitle")}</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                >
                    <Hammer className="w-5 h-5" />
                    {t("dashboard.customize")}
                </button>
            </header>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={visibleWidgets}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-min">
                        {visibleWidgets.map((type, index) => (
                            <SortableWidget key={type} id={type} index={index}>
                                {renderWidget(type)}
                            </SortableWidget>
                        ))}
                    </div>
                </SortableContext>

                <DragOverlay dropAnimation={{
                    duration: 300,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}>
                    {activeId ? (
                        <div className="transform transition-all duration-200" style={{
                            opacity: 0.95,
                            transform: 'scale(1.05) rotate(2deg)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            cursor: 'grabbing',
                        }}>
                            {renderWidget(activeId as WidgetType)}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <WidgetSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                preferences={Object.fromEntries(
                    Object.entries(widgetPreferences).map(([key, value]) => [key, value.visible])
                )}
                onToggle={handleToggleWidget}
            />
        </>
    );
}
