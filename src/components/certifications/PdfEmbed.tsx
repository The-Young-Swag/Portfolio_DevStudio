type PdfEmbedProps = {
    src: string;
    title: string;
    className?: string;
    /**
     * Thumbnails render non-interactive (no scrolling, first page
     * fitted) so they behave like static images. The detail preview
     * stays interactive so multi-page documents can be scrolled.
     */
    interactive?: boolean;
};

/**
 * Native browser PDF preview. Certificates display with the platform's
 * built-in viewer, so an uploaded PDF always shows the real document —
 * as a card thumbnail and as the detail preview — with no extra
 * libraries. Callers inside clickable cards pass pointer-events-none
 * so the embed never swallows clicks.
 */
export function PdfEmbed({ src, title, className, interactive = false }: PdfEmbedProps) {
    const params = interactive ? "#toolbar=0&navpanes=0" : "#toolbar=0&navpanes=0&page=1&view=Fit";

    return (
        <iframe
            src={`${src}${params}`}
            title={title}
            scrolling={interactive ? "auto" : "no"}
            tabIndex={interactive ? undefined : -1}
            className={className}
        />
    );
}
