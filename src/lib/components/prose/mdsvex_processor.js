// mdsvex-processor.js - Simple markdown processor with KaTeX (lazy loaded)
import { marked } from 'marked';

let katexModule = null;

async function loadKatex() {
    if (!katexModule) {
        katexModule = (await import('katex')).default;
    }
    return katexModule;
}

async function renderMarkdownWithKatex(markdown) {
    if (!markdown?.trim()) return '';

    if (typeof window === 'undefined' || !marked) {
        console.error("Marked not loaded");
        return `<p class="error">Error: Rendering libraries not loaded.</p>`;
    }

    try {
        // Lazy load KaTeX only when we detect math content
        const hasMath = /\$|\\\[|\\begin{align}/.test(markdown);
        const katex = hasMath ? await loadKatex() : null;

        // Un-escape backticks for Marked.js (from original)
        let processed = markdown.replace(/\\`/g, '`');

        if (katex) {
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
        }

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
