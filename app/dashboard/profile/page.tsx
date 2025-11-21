"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Mail, Camera, Loader2, Save, Upload } from "lucide-react";

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Veuillez sélectionner une image valide");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("L'image ne doit pas dépasser 5 MB");
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setImagePreview(result);
            setImageBase64(result);
        };
        reader.readAsDataURL(file);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            imageBase64: imageBase64 || undefined,
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

            const updatedUser = await res.json();

            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: data.name,
                    email: data.email,
                    image: updatedUser.image,
                },
            });

            setSuccess("Profil mis à jour avec succès !");
            setImagePreview(null);
            setImageBase64(null);
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

    const currentImage = imagePreview || session.user?.image;

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
                                {currentImage ? (
                                    currentImage.startsWith('/api/') ? (
                                        <img
                                            src={currentImage}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Image
                                            src={currentImage}
                                            alt="Profile"
                                            width={96}
                                            height={96}
                                            className="w-full h-full object-cover"
                                        />
                                    )
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <User className="w-10 h-10" />
                                    </div>
                                )}
                            </div>
                            <label
                                htmlFor="image-upload"
                                className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            >
                                <Camera className="w-6 h-6 text-white" />
                            </label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="image-upload" className="block text-sm font-medium text-slate-300 mb-2">
                                Photo de profil
                            </label>
                            <label
                                htmlFor="image-upload"
                                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-white cursor-pointer transition-all"
                            >
                                <Upload className="w-4 h-4" />
                                Choisir une image
                            </label>
                            <p className="text-xs text-slate-500 mt-2">
                                JPG, PNG ou GIF. Max 5 MB.
                            </p>
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
