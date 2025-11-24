"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type Locale = "en" | "fr" | "de";

type LocaleContextType = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Import translations
import enMessages from "@/messages/en.json";
import frMessages from "@/messages/fr.json";
import deMessages from "@/messages/de.json";

const messages = {
    en: enMessages,
    fr: frMessages,
    de: deMessages,
};

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("fr");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load locale from localStorage
        const savedLocale = localStorage.getItem("locale") as Locale | null;
        if (savedLocale && ["en", "fr", "de"].includes(savedLocale)) {
            setLocaleState(savedLocale);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem("locale", newLocale);
    };

    // Translation function
    const t = (key: string): string => {
        const keys = key.split(".");
        let value: any = messages[locale];

        for (const k of keys) {
            if (value && typeof value === "object") {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }

        return typeof value === "string" ? value : key;
    };

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const context = useContext(LocaleContext);
    if (context === undefined) {
        throw new Error("useLocale must be used within a LocaleProvider");
    }
    return context;
}
