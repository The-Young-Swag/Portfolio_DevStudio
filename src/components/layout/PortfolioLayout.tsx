import type { PropsWithChildren } from "react";
import { PageRail, Sidebar } from "@/components/navigation";

type PortfolioLayoutProps = PropsWithChildren;

export function PortfolioLayout({
    children,
}: PortfolioLayoutProps) {
    return (
        <div className="relative min-h-screen">
            {/* Background image / atmosphere */}
            <div
                className="app-background"
                aria-hidden="true"
            />

            <div className="relative z-10 min-h-screen">
                {/* Left glass navigation rail */}
                <Sidebar />

                {/* Main content */}
                <main
                    className="
                        min-w-0
                        lg:ml-82
                        lg:mr-70
                    "
                >
                    {children}
                </main>

                {/* Right page navigation */}
                <PageRail />
            </div>
        </div>
    );
}