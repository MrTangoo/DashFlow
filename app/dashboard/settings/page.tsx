"use client";

import { useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { Globe, Check } from "lucide-react";

export default function SettingsPage() {
    const { locale, setLocale, t } = useLocale();
    const [success, setSuccess] = useState("");

    const handleLocaleChange = (newLocale: "en" | "fr" | "de") => {
        setLocale(newLocale);
        setSuccess(t("settings.settingsSaved"));
        setTimeout(() => setSuccess(""), 3000);
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {t("settings.title")}
                </h1>
                <p className="text-gray-600 dark:text-slate-400">
                    {t("settings.subtitle")}
                </p>
            </div>

            {/* Success Message */}
            {success && (
                <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm animate-in fade-in slide-in-from-top-2">
                    {success}
                </div>
            )}

            {/* Language Section */}
            <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {t("settings.language")}
                    </h2>
                    <p className="text-gray-600 dark:text-slate-400 text-sm">
                        {t("settings.languageSubtitle")}
                    </p>
                </div>

                <div className="space-y-3">
                    {/* French */}
                    <button
                        onClick={() => handleLocaleChange("fr")}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${locale === "fr"
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                            <div className="text-left">
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {t("settings.french")}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-slate-500">
                                    Français
                                </div>
                            </div>
                        </div>
                        {locale === "fr" && (
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </button>

                    {/* English */}
                    <button
                        onClick={() => handleLocaleChange("en")}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${locale === "en"
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                            <div className="text-left">
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {t("settings.english")}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-slate-500">
                                    English
                                </div>
                            </div>
                        </div>
                        {locale === "en" && (
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </button>

                    {/* German */}
                    <button
                        onClick={() => handleLocaleChange("de")}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${locale === "de"
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                            <div className="text-left">
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {t("settings.german")}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-slate-500">
                                    Deutsch
                                </div>
                            </div>
                        </div>
                        {locale === "de" && (
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
