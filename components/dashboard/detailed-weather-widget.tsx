"use client"

import { useState, useEffect } from "react"
import { Search, Wind, Droplets, Thermometer, CloudSun, CloudRain, Sun, Cloud, CloudLightning, CloudSnow, Loader2, MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocale } from "@/components/locale-provider"

interface WeatherData {
    main: {
        temp: number
        humidity: number
        pressure: number
        feels_like: number
    }
    weather: {
        main: string
        description: string
    }[]
    wind: {
        speed: number
    }
    name: string
    sys: {
        country: string
    }
}

export default function DetailedWeatherWidget() {
    const { t, locale } = useLocale()
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchCity, setSearchCity] = useState("")
    const [error, setError] = useState("")

    useEffect(() => {
        if ("geolocation" in navigator) {
            const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    })
                },
                (error) => {
                    console.warn("Geolocation error:", error.code, error.message)
                    // Fallback to Paris if location fails
                    fetchWeather({ city: "Paris" })
                },
                options
            )
        } else {
            fetchWeather({ city: "Paris" })
        }
    }, [locale])

    const fetchWeather = async (params: { city?: string; lat?: number; lon?: number }) => {
        setLoading(true)
        setError("")
        try {
            let url = `/api/weather?lang=${locale}`
            if (params.lat && params.lon) {
                url += `&lat=${params.lat}&lon=${params.lon}`
            } else if (params.city) {
                url += `&city=${encodeURIComponent(params.city)}`
            }

            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                setWeather(data)
            } else {
                setError(t("widgets.weather.cityNotFound"))
            }
        } catch (error) {
            console.error("Failed to fetch weather", error)
            setError(t("widgets.weather.connectionError"))
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchCity.trim()) {
            fetchWeather({ city: searchCity })
        }
    }

    const getWeatherIcon = (main: string) => {
        switch (main?.toLowerCase()) {
            case "clouds":
                return <Cloud className="w-16 h-16 text-slate-300" />
            case "rain":
            case "drizzle":
                return <CloudRain className="w-16 h-16 text-blue-400" />
            case "thunderstorm":
                return <CloudLightning className="w-16 h-16 text-yellow-400" />
            case "snow":
                return <CloudSnow className="w-16 h-16 text-white" />
            case "clear":
                return <Sun className="w-16 h-16 text-yellow-400" />
            default:
                return <CloudSun className="w-16 h-16 text-yellow-400" />
        }
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full flex flex-col relative overflow-hidden group">
            {/* Decorative background blur */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10 transition-all duration-500 group-hover:bg-blue-500/20" />

            {/* Header / Search */}
            <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-2 text-white/60">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wider">{t("widgets.weather.title")}</span>
                </div>
                <form onSubmit={handleSearch} className="relative group/input flex-1 max-w-[200px]">
                    <input
                        type="text"
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                        placeholder={t("common.search")}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 pl-9 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/30"
                    />
                    <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                </form>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex-1 flex items-center justify-center text-red-400 text-sm">
                        {error}
                    </div>
                ) : weather ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col h-full justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-1">{weather.name}</h2>
                                <p className="text-blue-300 capitalize text-lg">{weather.weather[0].description}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                {getWeatherIcon(weather.weather[0].main)}
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="text-6xl font-bold text-white mb-8 tracking-tighter">
                                {Math.round(weather.main.temp)}°
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center gap-2">
                                    <Wind className="w-5 h-5 text-slate-400" />
                                    <span className="text-sm font-bold text-white">{Math.round(weather.wind.speed * 3.6)} km/h</span>
                                    <span className="text-[10px] text-white/40 uppercase">{t("widgets.weather.wind")}</span>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center gap-2">
                                    <Droplets className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm font-bold text-white">{weather.main.humidity}%</span>
                                    <span className="text-[10px] text-white/40 uppercase">{t("widgets.weather.humidity")}</span>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center gap-2">
                                    <Thermometer className="w-5 h-5 text-red-400" />
                                    <span className="text-sm font-bold text-white">{Math.round(weather.main.feels_like)}°</span>
                                    <span className="text-[10px] text-white/40 uppercase">{t("widgets.weather.feelsLike")}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </div>
        </div>
    )
}
