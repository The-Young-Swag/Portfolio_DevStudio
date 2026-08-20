import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";

import { PortfolioLayout } from "@/components/layout";

import {
    CertificationsPage,
    ExperiencePage,
    HomePage,
    ProjectsPage,
    StackPage,
} from "@/pages";

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

export function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route element={<PortfolioLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route path="experience" element={<ExperiencePage />} />
                    <Route path="stack" element={<StackPage />} />
                    <Route path="certifications" element={<CertificationsPage />} />
                    <Route path="*" element={<HomePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}