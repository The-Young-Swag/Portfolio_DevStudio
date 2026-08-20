import { Outlet } from "react-router";
import { MobileNav, PageRail, Sidebar } from "@/components/navigation";

export function PortfolioLayout() {
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

                {/* Mobile navigation */}
                <MobileNav />

                {/* Main content */}
                <main
                    className="
                        min-w-0
                        lg:ml-82
                        lg:mr-70
                    "
                >
                    {/* Clearance for the fixed mobile bar */}
                    <div className="h-[80px] lg:hidden" aria-hidden="true" />

                    <Outlet />
                </main>

                {/* Right page navigation */}
                <PageRail />
            </div>
        </div>
    );
}