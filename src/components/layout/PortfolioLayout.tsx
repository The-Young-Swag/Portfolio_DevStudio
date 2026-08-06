import type { PropsWithChildren } from "react";

import { RightRail, Sidebar } from "@/components/navigation";

type PortfolioLayoutProps = PropsWithChildren;

export function PortfolioLayout({
    children,
}: PortfolioLayoutProps) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1">
                {children}
            </main>

            <RightRail />
        </div>
    );
}