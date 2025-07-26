// mdsvex-processor.js - Simple markdown processor with KaTeX (matching original logic)
import { marked } from 'marked';
import katex from 'katex';

function renderMarkdownWithKatex(markdown) {
    if (!markdown?.trim()) return '';

    if (typeof window === 'undefined' || !katex || !marked) {
        console.error("KaTeX or Marked not loaded");
        return `<p class="error">Error: Rendering libraries not loaded.</p>`;
    }

    try {
        // Un-escape backticks for Marked.js (from original)
        let processed = markdown.replace(/\\`/g, '`');

        // First, render LaTeX environments like 'align' (from original)
        processed = processed.replace(/\\begin{align}([\s\S]*?)\\end{align}/g, (match, expression) => {
            try {
                // Un-escape backslashes for KaTeX newlines (from original)
                const cleanExpression = expression.replace(/\\\\/g, '\\\\');
                return katex.renderToString(`\\begin{align}${cleanExpression}\\end{align}`, {
                    displayMode: true,
                    throwOnError: false
                });
            } catch (e) {
                console.warn('KaTeX align error:', e);
                return match;
            }
        });

        // Then, render display math $...$ (from original)
        processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, expression) => {
            try {
                // Un-escape backslashes for KaTeX (from original)
                const cleanExpression = expression.replace(/\\\\/g, '\\');
                const result = katex.renderToString(cleanExpression, {
                    displayMode: true,
                    throwOnError: false
                });
                return result;
            } catch (e) {
                console.warn('KaTeX display math error:', e);
                return match;
            }
        });

        // Finally, render inline math $...$ (updated regex)
        processed = processed.replace(/\$([^$]+?)\$/g, (match, expression) => {
            try {
                // Un-escape backslashes for KaTeX (from original)
                const cleanExpression = expression.replace(/\\\\/g, '\\');
                const result = katex.renderToString(cleanExpression, {
                    displayMode: false,
                    throwOnError: false
                });
                return result;
            } catch (e) {
                console.warn('KaTeX inline math error:', e);
                return match;
            }
        });

        return marked.parse(processed);
    } catch (e) {
        console.error("Rendering error:", e);
        return `<p class="error">Markdown/KaTeX Error: ${e.message}</p>`;
    }
}

// Simple markdown processor with KaTeX support
export async function processMarkdown(markdown) {
    return renderMarkdownWithKatex(markdown);
}