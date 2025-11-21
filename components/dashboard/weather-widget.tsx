"use client"

import { useState, useEffect } from "react"
import { CloudSun, CloudRain, Sun, Cloud, CloudLightning, CloudSnow, Loader2 } from "lucide-react"

interface WeatherData {
    main: {
        temp: number
    }
    weather: {
        main: string
        description: string
    }[]
    name: string
}

export default function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchWeather()
    }, [])

    const fetchWeather = async () => {
        try {
            // Try to get user location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    // Reverse geocoding or just use coords if API supports it, 
                    // but for now let's stick to a default or simple city search if coords fail or complex.
                    // Actually OpenWeatherMap supports lat/lon. Let's try to use the city endpoint first for simplicity
                    // or just default to Paris if we want to keep it simple as per request.
                    // The user didn't ask for geolocation, just a widget. Let's default to Paris for now.
                    // If we want to be fancy we can add location later.

                    // Let's just fetch default for now to ensure it works.
                    const res = await fetch("/api/weather?city=Paris")
                    if (res.ok) {
                        const data = await res.json()
                        setWeather(data)
                    }
                    setLoading(false)
                }, () => {
                    // Permission denied or error, fetch default
                    fetchDefaultWeather()
                })
            } else {
                fetchDefaultWeather()
            }
        } catch (error) {
            console.error("Failed to fetch weather", error)
            setLoading(false)
        }
    }

    const fetchDefaultWeather = async () => {
        try {
            const res = await fetch("/api/weather?city=Paris")
            if (res.ok) {
                const data = await res.json()
                setWeather(data)
            }
        } catch (error) {
            console.error("Failed to fetch default weather", error)
        } finally {
            setLoading(false)
        }
    }

    const getWeatherIcon = (main: string) => {
        switch (main.toLowerCase()) {
            case "clouds":
                return <Cloud className="w-6 h-6 text-slate-400" />
            case "rain":
            case "drizzle":
                return <CloudRain className="w-6 h-6 text-blue-400" />
            case "thunderstorm":
                return <CloudLightning className="w-6 h-6 text-yellow-400" />
            case "snow":
                return <CloudSnow className="w-6 h-6 text-white" />
            case "clear":
                return <Sun className="w-6 h-6 text-yellow-400" />
            default:
                return <CloudSun className="w-6 h-6 text-yellow-400" />
        }
    }

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3 w-48 h-[74px] justify-center">
                <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
            </div>
        )
    }

    if (!weather) {
        return null
    }

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-default min-w-[200px]">
            <div className="p-2 bg-white/5 rounded-lg">
                {getWeatherIcon(weather.weather[0].main)}
            </div>
            <div>
                <p className="text-sm text-slate-400 capitalize">{weather.weather[0].description}</p>
                <p className="font-semibold text-white">{Math.round(weather.main.temp)}°C {weather.name}</p>
            </div>
        </div>
    )
}
