/**
 * When frontmatter has `slides: true`, split the document on horizontal rules
 * into plain `<section data-slide="N" class="slide">` HTML elements.
 *
 * These are standard HTML — no Svelte component mapping required.
 * The SlideDeck.svelte controller finds them via DOM queries at runtime.
 */
function isSlideSeparator(node) {
    if (node.type === 'thematicBreak')
        return true;
    if (node.type === 'paragraph') {
        const p = node;
        const ch = p.children;
        if (ch.length !== 1 || ch[0].type !== 'text')
            return false;
        const t = ch[0].value.trim();
        return /^-{3,}$|^\*{3,}$|^_{3,}$/.test(t);
    }
    return false;
}
export function remarkSlideSplit() {
    return (tree, file) => {
        const fm = file.data?.fm;
        if (!fm?.slides)
            return;
        const children = tree.children;
        const isFrontmatter = (n) => n.type === 'yaml' || n.type === 'toml';
        const preserved = children.filter(isFrontmatter);
        const body = children.filter(n => !isFrontmatter(n));
        const segments = [];
        let cur = [];
        for (const node of body) {
            if (isSlideSeparator(node)) {
                segments.push(cur);
                cur = [];
            }
            else {
                cur.push(node);
            }
        }
        segments.push(cur);
        const nonEmpty = segments.filter(s => s.length > 0);
        if (nonEmpty.length === 0)
            return;
        fm.slideSegmentCount = nonEmpty.length;
        const slideNodes = nonEmpty.map((seg, i) => ({
            type: 'blockquote',
            data: {
                hName: 'section',
                hProperties: { dataSlide: String(i), class: 'slide' }
            },
            children: seg
        }));
        tree.children = [...preserved, ...slideNodes];
    };
}
