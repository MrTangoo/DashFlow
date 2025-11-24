import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city") || "Paris"
    const lang = searchParams.get("lang") || "fr"

    const apiKey = process.env.OPEN_WEATHER_API

    if (!apiKey) {
        return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=${lang}&appid=${apiKey}`
        )

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch weather" }, { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
