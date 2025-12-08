"use client";

import { useLocale } from "@/components/locale-provider";
import { useState, useEffect } from "react";
import { Hammer } from "lucide-react";
import TasksWidget from "@/components/dashboard/tasks-widget";
import NotesWidget from "@/components/dashboard/notes-widget";
import StatsWidget from "@/components/dashboard/stats-widget";
import DetailedWeatherWidget from "@/components/dashboard/detailed-weather-widget";
import PomodoroWidget from "@/components/dashboard/pomodoro-widget";
import WaterTrackerWidget from "@/components/dashboard/water-tracker-widget";
import GitHubWidget from "@/components/dashboard/github-widget";
import WidgetSettingsModal from "@/components/dashboard/widget-settings-modal";

export default function DashboardContent({ session }: { session: any }) {
    const { t, locale } = useLocale();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [widgetPreferences, setWidgetPreferences] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);

    const currentDate = new Date().toLocaleDateString(locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    // Fetch widget preferences on mount
    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const response = await fetch("/api/widgets/preferences");
            if (response.ok) {
                const prefs = await response.json();
                setWidgetPreferences(prefs);
            }
        } catch (error) {
            console.error("Error fetching widget preferences:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleWidget = async (widgetType: string, visible: boolean) => {
        // Optimistic update
        setWidgetPreferences(prev => ({ ...prev, [widgetType]: visible }));

        try {
            const response = await fetch("/api/widgets/toggle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ widgetType, visible }),
            });

            if (!response.ok) {
                // Revert on error
                setWidgetPreferences(prev => ({ ...prev, [widgetType]: !visible }));
            }
        } catch (error) {
            console.error("Error toggling widget:", error);
            // Revert on error
            setWidgetPreferences(prev => ({ ...prev, [widgetType]: !visible }));
        }
    };

    const isWidgetVisible = (type: string) => {
        return widgetPreferences[type] ?? true;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-6">
                {/* Simple modern spinner */}
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-blue-500 animate-spin" />
                </div>

                {/* Loading Text */}
                <p className="text-lg text-slate-400 font-medium">
                    {t("common.loading")}
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-4">
                    {/* Profile Picture */}
                    {session.user?.image && (
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 shadow-xl bg-slate-800 flex-shrink-0">
                            {session.user.image.startsWith('/api/') ? (
                                <img
                                    src={session.user.image}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img
                                    src={session.user.image}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            )}
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

                {/* Customize Button */}
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                >
                    <Hammer className="w-5 h-5" />
                    {t("dashboard.customize")}
                </button>
            </header>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-min">
                {/* Tasks Widget - Spans 1 column */}
                {isWidgetVisible("tasks") && (
                    <div className="h-full">
                        <TasksWidget />
                    </div>
                )}

                {/* Notes Widget - Spans 1 column */}
                {isWidgetVisible("notes") && (
                    <div className="h-full">
                        <NotesWidget />
                    </div>
                )}

                {/* Stats Widget */}
                {isWidgetVisible("stats") && (
                    <div className="md:col-span-1 h-[400px]">
                        <StatsWidget />
                    </div>
                )}

                {/* GitHub Widget */}
                {isWidgetVisible("github") && (
                    <div className="md:col-span-1 h-[500px]">
                        <GitHubWidget />
                    </div>
                )}

                {/* Pomodoro Widget */}
                {isWidgetVisible("pomodoro") && (
                    <div className="md:col-span-1 h-[450px]">
                        <PomodoroWidget />
                    </div>
                )}

                {/* Water Tracker Widget */}
                {isWidgetVisible("waterTracker") && (
                    <div className="md:col-span-1 h-[450px]">
                        <WaterTrackerWidget />
                    </div>
                )}

                {/* Detailed Weather Widget */}
                {isWidgetVisible("weather") && (
                    <div className="md:col-span-1 h-[450px]">
                        <DetailedWeatherWidget />
                    </div>
                )}
            </div>

            {/* Widget Settings Modal */}
            <WidgetSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                preferences={widgetPreferences}
                onToggle={handleToggleWidget}
            />
        </>
    );
}
