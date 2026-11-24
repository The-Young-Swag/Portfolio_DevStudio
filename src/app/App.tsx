import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";

import { PortfolioLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui";
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

const AdminPage = lazy(() =>
    import("@/pages/AdminPage").then((module) => ({
        default: module.AdminPage,
    })),
);

function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash !== "") {
            document.getElementById(hash.slice(1))?.scrollIntoView();
            return;
        }

        window.scrollTo(0, 0);
    }, [pathname, hash]);

    return null;
}

function PageFallback() {
    return (
        <div className="pt-8 md:pt-10" role="status">
            <span className="sr-only">Loading page...</span>

            <div className="mx-auto w-full max-w-270 px-4 min-[400px]:px-5 lg:px-8">
                <Skeleton className="h-4 w-48" />

                <div className="mt-6 max-w-3xl">
                    <Skeleton className="h-[18px] w-56" />
                    <Skeleton className="mt-5 h-12 w-2/3" />

                    <div className="mt-5 max-w-2xl space-y-3">
                        {[0, 1, 2].map((line) => (
                            <Skeleton key={line} className="h-7 w-full" />
                        ))}
                    </div>
                </div>
            </div>
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

                <Route
                    path="admin"
                    element={
                        <Suspense fallback={<PageFallback />}>
                            <AdminPage />
                        </Suspense>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}