<script lang="ts">
  import Head from '$lib/components/head.svelte'
  import Specimen from '$lib/components/thread/Specimen.svelte'
  import { assets } from '$lib/config/assets'
  import { staticDocumentLinkAttrs } from '$lib/utils/static-links'
  import { resume } from '$lib/utils/resume'
</script>

<Head page={{ title: 'CV', path: '/cv' }} />

<div class="cv-bar col">
  <p class="smallcaps">Printable CV</p>
  <p>
    The same content as the <a href={assets.resume} {...staticDocumentLinkAttrs(assets.resume)}>PDF résumé</a>, typeset to match the site.
    <button class="pill" type="button" onclick={() => print()}>Print or save as PDF</button>
  </p>
</div>

<article class="sheet" aria-label="Curriculum vitae">
  <header>
    <div>
      <h1>{resume.name}</h1>
      <div class="links">
        {#each resume.links as [label, url], i}{#if i}{' · '}{/if}<a href={url}>{label}</a>{/each}
      </div>
    </div>
    <Specimen seed="Sai Kumar M.K." width={120} height={96} R={36} cy={0.45} species="rose" class="cv-rose" />
  </header>
  {#each resume.sections as s (s.title)}
    <section>
      <h2>{s.title}</h2>
      {#if s.skills.length}
        <dl class="skills">
          {#each s.skills as [k, v]}<div><dt>{k}</dt><dd>{@html v}</dd></div>{/each}
        </dl>
      {:else}
        {#each s.orgs as o}
          <div class="cv-org">
            <div class="cv-row"><b>{@html o.org}</b><span>{@html o.where}</span></div>
            {#each o.roles as r}
              {#if r.role || r.when}<div class="cv-row sub"><i>{@html r.role}</i><i>{@html r.when}</i></div>{/if}
              <ul>
                {#each r.pts as pt}<li>{@html pt}</li>{/each}
              </ul>
            {/each}
          </div>
        {/each}
      {/if}
    </section>
  {/each}
</article>

<style>
  .cv-bar { margin: 3.5rem 0 1.5rem; }
  .cv-bar p { margin: 0 0 0.4rem; color: var(--fg2); }
  .cv-bar .smallcaps { color: var(--muted); }

  /* a sheet of paper in either theme, so it prints the same way */
  .sheet { --bg: #fffdf7; --fg: #22212b; --fg2: #3b3946; --muted: #676171; --rule: #e2dacb; --c2: #146e78; --link: #3d4c9e;
    --r1: #6fb2cc; --r2: #2a8db3; --r3: #00688f; --r4: #003e57; --g1: #c29a3f; --g2: #8d6a22;
    color: var(--fg); background: var(--bg); width: min(100%, 50rem); aspect-ratio: 210 / 297; padding: 2.3rem 2.8rem; font-size: 12.5px; line-height: 1.38; position: relative;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05), 0 26px 50px -30px rgba(0, 0, 0, 0.45); overflow: hidden; color-scheme: light; }
  .sheet::after { content: ''; position: absolute; inset: 12px; border: 1.2px dashed color-mix(in srgb, var(--g1) 45%, transparent); pointer-events: none; }
  .sheet header { display: grid; grid-template-columns: 1fr auto; align-items: end; border-bottom: 1.5px dashed var(--g1); padding-bottom: 0.6rem; margin-bottom: 0.8rem; }
  .sheet h1 { font-weight: 400; font-size: 2.1rem; margin: 0; line-height: 1; }
  .sheet .links { font-family: var(--mono); font-size: 10.5px; color: var(--muted); margin-top: 0.45rem; }
  .sheet :global(a) { color: inherit; text-decoration-color: color-mix(in srgb, var(--g1) 60%, transparent); text-underline-offset: 2px; }
  .sheet :global(code) { font-family: var(--mono); font-size: 0.9em; }
  .sheet header :global(.cv-rose) { width: 5.6rem; height: 4.6rem; margin: -1rem -0.4rem -0.4rem 0; }
  .sheet h2 { font-family: var(--mono); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--c2); font-weight: 500; margin: 0.9rem 0 0.35rem; }
  .cv-org { margin-bottom: 0.5rem; }
  .cv-row { display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; }
  .cv-row b { font-weight: 500; font-size: 13.5px; }
  .cv-row > span { font-family: var(--mono); font-size: 10.5px; color: var(--muted); }
  .cv-row.sub { margin-top: 0.25rem; color: var(--fg2); }
  .cv-row.sub i:last-child { color: var(--muted); white-space: nowrap; }
  .sheet ul { margin: 0.1rem 0; padding-left: 1.1rem; list-style: disc; }
  .sheet li { margin: 0.08rem 0; }
  .sheet li::marker { color: var(--g1); }
  .skills { margin: 0; font-size: 12.5px; color: var(--fg2); }
  .skills div { display: grid; grid-template-columns: 8.5rem 1fr; gap: 1rem; }
  .skills dt { font-weight: 500; color: var(--fg); }
  .skills dd { margin: 0; }
  @media (max-width: 40rem) {
    .sheet { aspect-ratio: auto; padding: 1.6rem 1.3rem; }
    .cv-row { flex-direction: column; gap: 0; }
    .skills div { grid-template-columns: 1fr; gap: 0; }
  }

  @page { size: A4; margin: 0; }
  @media print {
    :global(html), :global(body) { background: #fff !important; }
    :global(body *) { visibility: hidden !important; }
    :global(header.site), :global(footer.site), :global(.skip), .cv-bar { display: none !important; }
    :global(.page) { position: static !important; padding: 0 !important; max-width: none !important; }
    .sheet, .sheet :global(*) { visibility: visible !important; }
    .sheet { position: absolute; left: 0; top: 0; width: 210mm; height: 297mm; aspect-ratio: auto; box-shadow: none; margin: 0; padding: 2.3rem 2.8rem; }
    .sheet :global(.thread .satin) { stroke-dashoffset: 0 !important; animation: none !important; }
    .sheet :global(.thread :is(.run, .under, .knot)) { opacity: 1 !important; animation: none !important; }
  }
</style>
