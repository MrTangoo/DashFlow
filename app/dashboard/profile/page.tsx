"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Mail, Camera, Loader2, Save, Upload, Lock } from "lucide-react";
import { useLocale } from "@/components/locale-provider";

export default function ProfilePage() {
    const { t } = useLocale();
    const { data: session, update } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    // Password change state
    const [hasPassword, setHasPassword] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [githubAvatar, setGithubAvatar] = useState<string | null>(null);

    // Check if user has password on mount
    useEffect(() => {
        async function checkHasPassword() {
            try {
                const res = await fetch("/api/user/has-password");
                if (res.ok) {
                    const data = await res.json();
                    setHasPassword(data.hasPassword);
                }
            } catch (error) {
                console.error("Error checking password:", error);
            }
        }

        async function fetchGithubAvatar() {
            try {
                const res = await fetch("/api/user/github-avatar");
                if (res.ok) {
                    const data = await res.json();
                    if (data.avatar) {
                        setGithubAvatar(data.avatar);
                    }
                }
            } catch (error) {
                console.error("Error fetching GitHub avatar:", error);
            }
        }

        if (session) {
            checkHasPassword();
            fetchGithubAvatar();
        }
    }, [session]);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError(t("profile.invalidImage"));
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError(t("profile.imageTooLarge"));
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

            setSuccess(t("profile.profileUpdated"));
            setImagePreview(null);
            setImageBase64(null);
            router.refresh();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(t("auth.errorOccurred"));
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setPasswordError(t("profile.passwordsDoNotMatch"));
            return;
        }

        // Validate password strength
        if (newPassword.length < 8) {
            setPasswordError(t("profile.passwordMinLength"));
            return;
        }

        setIsPasswordLoading(true);

        try {
            const res = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const text = await res.text();

            if (!res.ok) {
                throw new Error(text);
            }

            setPasswordSuccess(t("profile.passwordChanged"));
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            if (err instanceof Error) {
                setPasswordError(err.message);
            } else {
                setPasswordError(t("auth.errorOccurred"));
            }
        } finally {
            setIsPasswordLoading(false);
        }
    }

    if (!session) {
        return null;
    }

    const currentImage = imagePreview || session.user?.image || githubAvatar;


    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{t("profile.title")}</h1>
                <p className="text-slate-400">{t("profile.subtitle")}</p>
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
                                {t("profile.profilePicture")}
                            </label>
                            <label
                                htmlFor="image-upload"
                                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-white cursor-pointer transition-all"
                            >
                                <Upload className="w-4 h-4" />
                                {t("profile.chooseImage")}
                            </label>
                            <p className="text-xs text-slate-500 mt-2">
                                {t("profile.imageInfo")}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {t("profile.fullName")}
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
                                {t("profile.emailAddress")}
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
                                    {t("profile.saving")}
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    {t("profile.saveChanges")}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Password Change Section - Only for credential users */}
            {hasPassword && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mt-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">{t("profile.changePassword")}</h2>
                        <p className="text-slate-400 text-sm">{t("profile.changePasswordSubtitle")}</p>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-6">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {t("profile.currentPassword")}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    placeholder={t("profile.currentPasswordPlaceholder")}
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {t("profile.newPassword")}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    placeholder={t("profile.newPasswordPlaceholder")}
                                />
                            </div>
                            {newPassword && newPassword.length < 8 && (
                                <p className="text-xs text-orange-400 mt-1">
                                    {t("profile.passwordMinLength")}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {t("profile.confirmNewPassword")}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    placeholder={t("profile.confirmPasswordPlaceholder")}
                                />
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-xs text-orange-400 mt-1">
                                    {t("profile.passwordsDoNotMatch")}
                                </p>
                            )}
                        </div>

                        {/* Password Feedback Messages */}
                        {passwordError && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {passwordError}
                            </div>
                        )}
                        {passwordSuccess && (
                            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                                {passwordSuccess}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isPasswordLoading}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20"
                            >
                                {isPasswordLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {t("profile.changing")}
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5" />
                                        {t("profile.changePasswordButton")}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
