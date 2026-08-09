import type { PropsWithChildren } from "react";

import { PageRail, Sidebar } from "@/components/navigation";

type PortfolioLayoutProps = PropsWithChildren;

export function PortfolioLayout({
    children,
}: PortfolioLayoutProps) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="min-w-0 flex-1">
                {children}
            </main>

            <PageRail />
        </div>
    );
}