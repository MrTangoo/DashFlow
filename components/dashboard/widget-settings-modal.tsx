"use client";

import { useLocale } from "@/components/locale-provider";
import { X, CheckCircle2, Circle } from "lucide-react";
import {
    ListTodo,
    StickyNote,
    BarChart3,
    Github,
    Timer,
    Droplet,
    Cloud
} from "lucide-react";

interface WidgetSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    preferences: Record<string, boolean>;
    onToggle: (widgetType: string, visible: boolean) => void;
}

const WIDGET_TYPES = [
    { type: "tasks", icon: ListTodo, color: "text-blue-400" },
    { type: "notes", icon: StickyNote, color: "text-yellow-400" },
    { type: "stats", icon: BarChart3, color: "text-purple-400" },
    { type: "github", icon: Github, color: "text-gray-300" },
    { type: "pomodoro", icon: Timer, color: "text-red-400" },
    { type: "waterTracker", icon: Droplet, color: "text-cyan-400" },
    { type: "weather", icon: Cloud, color: "text-indigo-400" },
];

export default function WidgetSettingsModal({
    isOpen,
    onClose,
    preferences,
    onToggle,
}: WidgetSettingsModalProps) {
    const { t } = useLocale();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {t("dashboard.widgetSettings")}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            {t("dashboard.widgetSettingsSubtitle")}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Widget List */}
                <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                    {WIDGET_TYPES.map(({ type, icon: Icon, color }) => {
                        const isVisible = preferences[type] ?? true;

                        return (
                            <button
                                key={type}
                                onClick={() => onToggle(type, !isVisible)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${isVisible
                                    ? "bg-white/10 border border-white/20 shadow-lg"
                                    : "bg-white/5 border border-white/5 hover:bg-white/10"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`p-2 rounded-lg bg-white/10 ${isVisible ? color : "text-slate-500"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span
                                        className={`font-medium ${isVisible ? "text-white" : "text-slate-500"
                                            }`}
                                    >
                                        {t(`widgets.${type}.title`)}
                                    </span>
                                </div>

                                {isVisible ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                ) : (
                                    <Circle className="w-5 h-5 text-slate-600" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        {t("common.save")}
                    </button>
                </div>
            </div>
        </div>
    );
}
