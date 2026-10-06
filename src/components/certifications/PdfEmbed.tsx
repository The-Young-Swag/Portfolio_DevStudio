type PdfEmbedProps = {
    src: string;
    title: string;
    className?: string;
};

/**
 * Native browser PDF preview. Certificates display with the platform's
 * built-in viewer, so an uploaded PDF always shows the real document —
 * as a card thumbnail and as the detail preview — with no extra
 * libraries. Callers inside clickable cards pass pointer-events-none
 * so the embed never swallows clicks.
 */
export function PdfEmbed({ src, title, className }: PdfEmbedProps) {
    return (
        <object
            data={`${src}#toolbar=0&navpanes=0`}
            type="application/pdf"
            title={title}
            className={className}
        />
    );
}
