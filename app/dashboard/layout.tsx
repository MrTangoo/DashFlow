import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "./layout-client";

import prisma from "@/lib/prisma";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const tasks = await prisma.task.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    })

    return <DashboardLayoutClient tasks={tasks}>{children}</DashboardLayoutClient>;
}
