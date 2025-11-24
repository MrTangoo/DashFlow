"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { useLocale } from "@/components/locale-provider";

export default function PomodoroWidget() {
    const { t } = useLocale()
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<"work" | "break">("work");

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive) {
            interval = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        // Timer finished
                        setIsActive(false);
                        if (mode === "work") {
                            setMode("break");
                            setMinutes(5);
                        } else {
                            setMode("work");
                            setMinutes(25);
                        }
                    } else {
                        setMinutes(minutes - 1);
                        setSeconds(59);
                    }
                } else {
                    setSeconds(seconds - 1);
                }
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, minutes, seconds, mode]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        if (mode === "work") {
            setMinutes(25);
        } else {
            setMinutes(5);
        }
        setSeconds(0);
    };

    const switchMode = (newMode: "work" | "break") => {
        setIsActive(false);
        setMode(newMode);
        if (newMode === "work") {
            setMinutes(25);
        } else {
            setMinutes(5);
        }
        setSeconds(0);
    };

    const progress = mode === "work"
        ? ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100
        : ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100;

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/[0.07] transition-all duration-300 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                        <Clock className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{t("widgets.pomodoro.title")}</h2>
                </div>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => switchMode("work")}
                    className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${mode === "work"
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30"
                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                        }`}
                >
                    {t("widgets.pomodoro.work")}
                </button>
                <button
                    onClick={() => switchMode("break")}
                    className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${mode === "break"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                        }`}
                >
                    {t("widgets.pomodoro.break")}
                </button>
            </div>

            {/* Timer Display */}
            <div className="flex-1 flex items-center justify-center mb-6">
                <div className="relative">
                    {/* Progress Circle */}
                    <svg className="w-48 h-48 transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-white/10"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 88}`}
                            strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                            className={mode === "work" ? "text-orange-500" : "text-green-500"}
                            strokeLinecap="round"
                        />
                    </svg>
                    {/* Time Display */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-white tabular-nums">
                                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                            </div>
                            <div className="text-sm text-slate-400 mt-2">
                                {mode === "work" ? t("widgets.pomodoro.workSession") : t("widgets.pomodoro.breakSession")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
                <button
                    onClick={toggleTimer}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${isActive
                        ? "bg-white/10 hover:bg-white/15 text-white"
                        : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30"
                        }`}
                >
                    {isActive ? (
                        <>
                            <Pause className="w-5 h-5" />
                            {t("widgets.pomodoro.pause")}
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5" />
                            {t("widgets.pomodoro.start")}
                        </>
                    )}
                </button>
                <button
                    onClick={resetTimer}
                    className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                    title={t("widgets.pomodoro.reset")}
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
