import type { PropsWithChildren } from "react";

import { Sidebar } from "@/components/navigation";

type PortfolioLayoutProps = PropsWithChildren;

export function PortfolioLayout({
    children,
}: PortfolioLayoutProps) {
    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="mx-auto flex max-w-[1600px]">
                <Sidebar />

                <main className="min-w-0 flex-1">
                    {children}
                </main>

                {/* Reserved for future right rail */}
                <aside className="hidden xl:block w-72 shrink-0" />
            </div>
        </div>
    );
}