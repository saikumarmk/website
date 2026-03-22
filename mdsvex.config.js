// rehype plugins
import { rehypeLayoutMdsvexComponents } from './src/lib/mdsvex/rehype-layout-mdsvex-components.js';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import { remarkSlideSplit } from './src/lib/slides/remark-slide-split.js';
import { parse, join, resolve } from 'path';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import Slugger from 'github-slugger';
import remarkFFF from 'remark-fff';
import remarkFootnotes from 'remark-footnotes';
import rehypeKatexSvelte from "rehype-katex-svelte";
import remarkMath from 'remark-math';
// highlighter
import { escapeSvelte } from 'mdsvex';
import { lex, parse as parseFence } from 'fenceparser';
import { renderCodeToHTML, runTwoSlash, createShikiHighlighter } from 'shiki-twoslash';
// Strip Svelte component tags from heading text for ToC
const cleanHeadingText = (text) => {
    return text
        .replace(/<[A-Z][a-zA-Z]*\s[^>]*\/>/g, '') // Self-closing components like <PokemonSprite ... />
        .replace(/<[A-Z][a-zA-Z]*[^>]*>.*?<\/[A-Z][a-zA-Z]*>/g, '') // Components with children
        .trim();
};
const remarkUraraFm = () => (tree, { data, filename }) => {
    const filepath = filename ? filename.split('/src/routes')[1] : 'unknown';
    const { dir, name } = parse(filepath);
    if (!data.fm)
        data.fm = {};
    // Generate slug & path
    data.fm.slug = filepath;
    data.fm.path = join(dir, `/${name}`.replace('/+page', '').replace('.svelte', ''));
    // Generate ToC
    if (data.fm.toc !== false) {
        const [slugs, toc] = [new Slugger(), []];
        visit(tree, 'heading', (node) => {
            const rawTitle = toString(node);
            const cleanTitle = cleanHeadingText(rawTitle);
            toc.push({
                depth: node.depth,
                title: cleanTitle,
                slug: slugs.slug(rawTitle, false) // Keep raw for slug matching
            });
        });
        if (toc.length > 0)
            data.fm.toc = toc;
        else
            data.fm.toc = false;
    }
};
// Better type definitions needed
const remarkUraraSpoiler = () => (tree) => visit(tree, 'paragraph', (node) => {
    const { children } = node;
    const text = children[0].value;
    const re = /\|\|(.{1,}?)\|\|/g;
    if (re.test(children[0].value)) {
        children[0].type = 'html';
        children[0].value = text.replace(re, (_match, p1) => `<span class="spoiler">${p1}</span>`);
    }
    return node;
});
const defineConfig = (config) => config;
export default defineConfig({
    extensions: ['.svelte.md', '.md'],
    smartypants: {
        dashes: 'oldschool'
    },
    layout: {
        _: resolve('src/lib/components/post_layout.svelte')
    },
    highlight: {
        highlighter: async (code, lang, meta) => {
            let fence;
            let twoslash;
            try {
                fence = parseFence(lex([lang, meta].filter(Boolean).join(' ')));
            }
            catch (error) {
                throw new Error(`Could not parse the codefence for this code sample \n${code}`);
            }
            if (fence?.twoslash === true)
                twoslash = runTwoSlash(code, lang);
            return `{@html \`${escapeSvelte(renderCodeToHTML(code, lang, fence ?? {}, { themeName: 'monokai' }, await createShikiHighlighter({ theme: 'monokai' }), twoslash))}\` }`;
        }
    },
    remarkPlugins: [
        [
            remarkFFF,
            {
                presets: ['hugo'],
                target: 'mdsvex',
                autofill: {
                    provider: 'fs',
                    path: (path) => {
                        // All markdown content lives in urara/ and gets copied to src/routes/
                        return path.replace('/src/routes/', '/urara/');
                    }
                }
            }
        ],
        remarkSlideSplit,
        remarkUraraFm,
        remarkUraraSpoiler,
        [remarkFootnotes, { inlineNotes: true }],
        remarkMath
    ],
    rehypePlugins: [
        // Map <Mermaid /> etc. in raw HTML to Components.* (see plugin file — mdsvex only rewrites HAST elements).
        rehypeLayoutMdsvexComponents,
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        [
            rehypeExternalLinks,
            {
                rel: ['nofollow', 'noopener', 'noreferrer', 'external'],
                target: '_blank'
            }
        ],
        [
            rehypeKatexSvelte,
            {
                macros: {
                    "\\CC": "\\mathbb{C}",
                    "\\vec": "\\mathbf",
                },
            },
        ],
    ]
});
