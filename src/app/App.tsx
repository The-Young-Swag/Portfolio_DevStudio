import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";

import { PortfolioLayout } from "@/components/layout";
import { HomePage } from "@/pages";

const ProjectsPage = lazy(() =>
    import("@/pages/ProjectsPage").then((module) => ({
        default: module.ProjectsPage,
    })),
);

const ExperiencePage = lazy(() =>
    import("@/pages/ExperiencePage").then((module) => ({
        default: module.ExperiencePage,
    })),
);

const StackPage = lazy(() =>
    import("@/pages/StackPage").then((module) => ({
        default: module.StackPage,
    })),
);

const CertificationsPage = lazy(() =>
    import("@/pages/CertificationsPage").then((module) => ({
        default: module.CertificationsPage,
    })),
);

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function PageFallback() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--graphite-soft)">
                Loading…
            </p>
        </div>
    );
}

export function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route element={<PortfolioLayout />}>
                    <Route index element={<HomePage />} />
                    <Route
                        path="projects"
                        element={
                            <Suspense fallback={<PageFallback />}>
                                <ProjectsPage />
                            </Suspense>
                        }
                    />
                    <Route
                        path="experience"
                        element={
                            <Suspense fallback={<PageFallback />}>
                                <ExperiencePage />
                            </Suspense>
                        }
                    />
                    <Route
                        path="stack"
                        element={
                            <Suspense fallback={<PageFallback />}>
                                <StackPage />
                            </Suspense>
                        }
                    />
                    <Route
                        path="certifications"
                        element={
                            <Suspense fallback={<PageFallback />}>
                                <CertificationsPage />
                            </Suspense>
                        }
                    />
                    <Route path="*" element={<HomePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}