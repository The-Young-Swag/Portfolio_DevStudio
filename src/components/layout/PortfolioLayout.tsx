import { Outlet, useLocation } from "react-router";
import { MobileNav, PageRail, Sidebar } from "@/components/navigation";

export function PortfolioLayout() {
    const { pathname } = useLocation();

    // The Projects page manages its own two-column layout against the real
    // content width, so the fixed right rail (and its reserved margin) would
    // only squeeze it. Every other route keeps the rail.
    const fullWidth = pathname.startsWith("/projects");

    return (
        <div className="relative min-h-dvh">
            {/* Background image / atmosphere */}
            <div
                className="app-background"
                aria-hidden="true"
            />

            <div className="relative z-10 min-h-dvh">
                {/* Left glass navigation rail */}
                <Sidebar />

                {/* Mobile navigation */}
                <MobileNav />

                {/* Main content */}
                <main
                    className={
                        fullWidth
                            ? "min-w-0 lg:ml-82"
                            : "min-w-0 lg:ml-82 lg:mr-70"
                    }
                >
                    {/* Clearance for the fixed mobile bar */}
                    <div className="h-[80px] lg:hidden" aria-hidden="true" />

                    <Outlet />
                </main>

                {/* Right page navigation */}
                {!fullWidth && <PageRail />}
            </div>
        </div>
    );
}