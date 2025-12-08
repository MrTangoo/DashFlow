"use client"

import { useState, useEffect } from "react"
import { Github, GitCommit, FolderGit2, TrendingUp, Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useLocale } from "@/components/locale-provider"

interface GitHubStats {
    commitsToday: number
    reposToday: number
    productivity: "Low" | "Medium" | "High"
    username: string
    avatar: string
}

interface GitHubCommit {
    message: string
    repo: string
    timestamp: string
    sha: string
}

export default function GitHubWidget() {
    const { t } = useLocale()
    const [stats, setStats] = useState<GitHubStats | null>(null)
    const [commits, setCommits] = useState<GitHubCommit[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchGitHubData()
    }, [])

    const fetchGitHubData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch stats
            const statsRes = await fetch("/api/github/stats")
            if (!statsRes.ok) {
                if (statsRes.status === 404) {
                    setError("not_linked")
                    setLoading(false)
                    return
                }
                throw new Error("Failed to fetch stats")
            }
            const statsData = await statsRes.json()
            setStats(statsData)

            // Fetch activity
            const activityRes = await fetch("/api/github/activity")
            if (activityRes.ok) {
                const activityData = await activityRes.json()
                setCommits(activityData)
            }

            setLoading(false)
        } catch (err) {
            console.error("Error fetching GitHub data:", err)
            setError("fetch_error")
            setLoading(false)
        }
    }

    const getProductivityColor = (level: string) => {
        switch (level) {
            case "High":
                return "text-emerald-400"
            case "Medium":
                return "text-yellow-400"
            case "Low":
                return "text-slate-400"
            default:
                return "text-slate-400"
        }
    }

    const getRelativeTime = (timestamp: string) => {
        const now = new Date()
        const then = new Date(timestamp)
        const diffMs = now.getTime() - then.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)

        if (diffMins < 1) return t("widgets.github.justNow")
        if (diffMins < 60) return `${diffMins}${t("widgets.github.minutesAgo")}`
        if (diffHours < 24) return `${diffHours}${t("widgets.github.hoursAgo")}`
        return then.toLocaleDateString()
    }

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
            </div>
        )
    }

    if (error === "not_linked") {
        return (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px] -z-10" />
                <Github className="w-12 h-12 text-white/20" />
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">{t("widgets.github.notConnected")}</h3>
                    <p className="text-sm text-slate-400">{t("widgets.github.connectPrompt")}</p>
                </div>
            </div>
        )
    }

    if (error || !stats) {
        return (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">{t("widgets.github.errorLoading")}</h3>
                    <p className="text-sm text-slate-400">{t("widgets.github.errorFetching")}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full flex flex-col relative overflow-hidden group">
            {/* Decorative background blur */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px] -z-10 transition-all duration-500 group-hover:bg-purple-500/20" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400">
                        <Github className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{t("widgets.github.title")}</h2>
                        <p className="text-xs text-slate-400 font-medium">{t("widgets.github.subtitle")}</p>
                    </div>
                </div>
                {stats.avatar && (
                    <img
                        src={stats.avatar}
                        alt={stats.username}
                        className="w-10 h-10 rounded-full border-2 border-white/10"
                    />
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors"
                >
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <GitCommit className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">{t("widgets.github.commits")}</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.commitsToday}</div>
                    <div className="text-xs text-white/40 mt-1">{t("widgets.github.today")}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors"
                >
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                        <FolderGit2 className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">{t("widgets.github.repos")}</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.reposToday}</div>
                    <div className="text-xs text-white/40 mt-1">{t("widgets.github.workedOn")}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors"
                >
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">{t("widgets.github.level")}</span>
                    </div>
                    <div className={`text-2xl font-bold ${getProductivityColor(stats.productivity)}`}>
                        {stats.productivity}
                    </div>
                    <div className="text-xs text-white/40 mt-1">{t("widgets.github.productivity")}</div>
                </motion.div>
            </div>

            {/* Commits List */}
            <div className="flex-1 flex flex-col min-h-0">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                    {t("widgets.github.todaysCommits")}
                </h3>

                {commits.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <GitCommit className="w-8 h-8 text-white/10 mx-auto mb-2" />
                            <p className="text-sm text-white/40">{t("widgets.github.noCommits")}</p>
                            <p className="text-xs text-white/20 mt-1">{t("widgets.github.timeToCode")}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {commits.map((commit, index) => (
                            <motion.div
                                key={commit.sha}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white/5 rounded-xl p-3 border border-white/5 hover:bg-white/10 transition-all group/commit"
                            >
                                <div className="flex items-start gap-2">
                                    <GitCommit className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white font-medium truncate group-hover/commit:text-purple-300 transition-colors">
                                            {commit.message.split('\n')[0]}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-400 truncate">{commit.repo}</span>
                                            <span className="text-xs text-white/20">•</span>
                                            <span className="text-xs text-white/30">{getRelativeTime(commit.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
