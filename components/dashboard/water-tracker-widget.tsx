"use client";

import { useState, useEffect } from "react";
import { Droplet, Plus, Minus, RotateCcw } from "lucide-react";

export default function WaterTrackerWidget() {
    const [bottles, setBottles] = useState(0);
    const [loading, setLoading] = useState(true);
    const bottleSize = 1; // 1L per bottle
    const dailyGoalLiters = 4; // 4L per day
    const dailyGoalBottles = dailyGoalLiters / bottleSize; // 4 bottles

    // Load from API on mount
    useEffect(() => {
        fetchWaterData();
    }, []);

    const fetchWaterData = async () => {
        try {
            const res = await fetch("/api/daily-data");
            if (res.ok) {
                const data = await res.json();
                setBottles(data.waterBottles || 0);
            }
        } catch (error) {
            console.error("Error fetching water data:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateWaterData = async (newBottles: number) => {
        try {
            const res = await fetch("/api/daily-data", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ waterBottles: newBottles }),
            });
            if (res.ok) {
                const data = await res.json();
                setBottles(data.waterBottles);
            }
        } catch (error) {
            console.error("Error updating water data:", error);
        }
    };

    const addBottle = () => {
        const newBottles = bottles + 1;
        setBottles(newBottles);
        updateWaterData(newBottles);
    };

    const removeBottle = () => {
        if (bottles > 0) {
            const newBottles = bottles - 1;
            setBottles(newBottles);
            updateWaterData(newBottles);
        }
    };

    const reset = () => {
        setBottles(0);
        updateWaterData(0);
    };

    const currentLiters = bottles * bottleSize;
    const progress = (currentLiters / dailyGoalLiters) * 100;

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full flex flex-col relative overflow-hidden group">
            {/* Decorative background blur */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] -z-10 transition-all duration-500 group-hover:bg-blue-500/20" />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                        <Droplet className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Hydratation</h2>
                        <p className="text-xs text-slate-400 font-medium">
                            {currentLiters.toFixed(1)}L / {dailyGoalLiters}L
                        </p>
                    </div>
                </div>
                <button
                    onClick={reset}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
                    title="Réinitialiser"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                    <span>0L</span>
                    <span className={currentLiters >= dailyGoalLiters ? "text-green-400 font-semibold" : ""}>
                        {currentLiters >= dailyGoalLiters ? "Objectif atteint ! 🎉" : `${Math.round(progress)}%`}
                    </span>
                    <span>{dailyGoalLiters}L</span>
                </div>
            </div>

            {/* Water Bottles Display */}
            <div className="flex-1 flex flex-col items-center justify-center mb-6">
                {/* Large counter */}
                <div className="text-center mb-4">
                    <div className="text-6xl font-bold text-white tabular-nums">
                        {bottles || 0}
                    </div>
                    <div className="text-sm text-slate-400 mt-2">
                        gourde{bottles !== 1 ? "s" : ""} de {bottleSize}L
                    </div>
                </div>

                {/* Visual bottles grid */}
                <div className="flex gap-4">
                    {Array.from({ length: dailyGoalBottles }).map((_, index) => (
                        <div
                            key={index}
                            className={`relative w-12 h-16 rounded-lg border-2 transition-all duration-300 ${index < bottles
                                ? "border-blue-500 bg-gradient-to-t from-blue-500/50 to-blue-500/20"
                                : "border-white/20 bg-white/5"
                                }`}
                        >
                            {/* Water level animation */}
                            {index < bottles && (
                                <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-blue-500/60 to-transparent rounded-lg" />
                            )}
                            {/* Bottle cap */}
                            <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-2 rounded-t ${index < bottles ? "bg-blue-400" : "bg-white/20"
                                }`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
                <button
                    onClick={removeBottle}
                    disabled={bottles === 0}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <Minus className="w-5 h-5" />
                    Retirer
                </button>
                <button
                    onClick={addBottle}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                >
                    <Plus className="w-5 h-5" />
                    Ajouter
                </button>
            </div>
        </div>
    );
}
