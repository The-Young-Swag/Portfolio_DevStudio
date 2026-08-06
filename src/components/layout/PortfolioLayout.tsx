import type { PropsWithChildren } from "react";

type PortfolioLayoutProps = PropsWithChildren;

export function PortfolioLayout({
    children,
}: PortfolioLayoutProps) {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
}