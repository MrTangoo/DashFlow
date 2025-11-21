"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Mail, Camera, Loader2, Save } from "lucide-react";

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            image: formData.get("image"),
        };

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }

            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: data.name,
                    email: data.email,
                    image: data.image,
                },
            });

            setSuccess("Profil mis à jour avec succès !");
            router.refresh();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Une erreur est survenue");
            }
        } finally {
            setIsLoading(false);
        }
    }

    if (!session) {
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Mon Profil</h1>
                <p className="text-slate-400">Gérez vos informations personnelles</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6 mb-8">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 shadow-xl bg-slate-800">
                                {session.user?.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt="Profile"
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <User className="w-10 h-10" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                URL de l'image de profil
                            </label>
                            <input
                                type="url"
                                name="image"
                                defaultValue={session.user?.image || ""}
                                placeholder="https://example.com/avatar.jpg"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Nom complet
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    defaultValue={session.user?.name || ""}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Adresse email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    defaultValue={session.user?.email || ""}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Feedback Messages */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                            {success}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Enregistrer les modifications
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
