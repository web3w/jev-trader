import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

for (const route of ['index.html', 'zh/index.html']) {
  test(`${route}: central sphere is branded JEVM, with matching accessible naming`, async () => {
    const html = await readFile(new URL(`../jevm-site/${route}`, import.meta.url), 'utf8');
    const coreName = html.match(/class="core-label"[^>]*><span>([^<]+)<\/span>/)?.[1];
    assert.equal(coreName, 'JEVM');
    assert.match(html, /<canvas[^>]*aria-label="[^"]*JEVM[^"]*"/);
    assert.match(html, /data-step="1"[^>]*>[\s\S]*?<small>JEV /, 'The decision model keeps its JEV name');
  });

  test(`${route}: market controls map to server-readable descriptions`, async () => {
    const html = await readFile(new URL(`../jevm-site/${route}`, import.meta.url), 'utf8');
    const controls = [...html.matchAll(/<button\b[^>]*data-market="([^"]+)"[^>]*>/g)];
    assert.equal(controls.length, 5, 'Five asset/instrument groups must be selectable');
    assert.equal(controls.filter(([tag]) => tag.includes('aria-pressed="true"')).length, 1);
    for (const [tag, market] of controls) {
      assert.ok(tag.includes(`aria-controls="market-${market}"`));
      assert.match(html, new RegExp(`<article[^>]*id="market-${market}"[^>]*>[\\s\\S]+?</article>`));
    }
    assert.match(html, /<canvas[^>]*aria-describedby="scene-help"/);
    assert.match(html, /<script[^>]*src="\/assets\/universe\.js(?:\?[^"]*)?"/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.ok(!html.includes('market-stack.svg'), 'Replace the flat diagram');
  });

  test(`${route}: JEV + EVM and dated, sourced news are present in the initial HTML`, async () => {
    const html = await readFile(new URL(`../jevm-site/${route}`, import.meta.url), 'utf8');
    const hero = html.slice(html.indexOf('<section class="hero'), html.indexOf('<figure class="universe'));
    assert.match(hero, /JEV[\s\S]*\+[\s\S]*EVM/);
    assert.match(html, /href="#news"/);
    const news = html.match(/<section class="news-section"[\s\S]*?<\/section>/)?.[0];
    assert.ok(news, 'News must be readable without JavaScript');
    assert.equal((news.match(/class="news-item/g) || []).length, 4);
    assert.equal((news.match(/<time datetime="\d{4}-\d{2}-\d{2}">/g) || []).length, 5);
    assert.equal((news.match(/class="news-source" href="https:\/\//g) || []).length, 4);
    assert.equal((news.match(/class="news-interpretation"/g) || []).length, 4);
    assert.match(news, /class="news-disclaimer"/);
  });

  test(`${route}: six decision stages expose a manual, readable alternative to animation`, async () => {
    const html = await readFile(new URL(`../jevm-site/${route}`, import.meta.url), 'utf8');
    const steps = [...html.matchAll(/<button[^>]*data-step="(\d)"[^>]*>/g)];
    assert.equal(steps.length, 6);
    for (const [tag, step] of steps) {
      assert.ok(tag.includes(`aria-controls="flow-${step}"`));
      assert.match(html, new RegExp(`<article id="flow-${step}"`));
    }
    assert.match(html, /class="flow-disclaimer"/);
    assert.match(html, /data-action="motion"/);
    assert.match(html, /data-action="reset"/);
  });

  test(`${route}: the brand equation has its own full-width row outside the offset introduction`, async () => {
    const html = await readFile(new URL(`../jevm-site/${route}`, import.meta.url), 'utf8');
    const introduction = html.match(/<div class="thesis-main">[\s\S]*?<\/div>/)?.[0];
    assert.ok(introduction);
    assert.doesNotMatch(introduction, /class="equation"/, 'The equation must not inherit the introduction column offset');
    assert.match(html, /<div class="thesis-notes">\s*<p class="thesis-boundary">/);
  });
}

test('orbit geometry and workflow timing stay deterministic', async () => {
  const model = await import('../jevm-site/assets/orbit-model.mjs').catch(() => null);
  assert.ok(model, 'The scene needs testable orbit geometry and cycle timing');
  const { orbitPosition, projectPosition, workflowAt } = model;
  for (let i = 0; i < 5; i++) {
    const initial = orbitPosition(i, 0);
    const later = orbitPosition(i, 10);
    assert.notDeepEqual(initial, later, 'Each planet revolves');
    assert.ok(Math.abs(Math.hypot(...initial) - Math.hypot(...later)) < 1e-9);
    for (const t of [0, 20, 90, 180]) {
      const point = projectPosition(orbitPosition(i, t), [-0.17, 0.32], 1000, 490, 6.8);
      assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
      assert.ok(point.scale > 0);
      assert.ok(point.y > 25 && point.y < 465, 'Planet centers stay inside the canvas');
    }
  }
  assert.deepEqual(workflowAt(0), { step: 0, progress: 0 });
  assert.deepEqual(workflowAt(5), { step: 1, progress: 0 });
  assert.deepEqual(workflowAt(29), { step: 5, progress: 0.8 });
  assert.deepEqual(workflowAt(30), { step: 0, progress: 0 });
  assert.equal(projectPosition([0, 0, 0], [0, 0], 1000, 490, 6.8).x, 500);
  assert.equal(projectPosition([0, 0, 0], [0, 0], 1000, 490, 6.8).y, 245);
  assert.ok(projectPosition([0, 0, 1], [0, 0], 1000, 490, 6.8).scale > projectPosition([0, 0, -1], [0, 0], 1000, 490, 6.8).scale);
});

test('English is the stable default; Chinese remains an explicit alternative', async () => {
  const html = await readFile(new URL('../jevm-site/index.html', import.meta.url), 'utf8');
  assert.match(html, /<html lang="en">/);
  assert.match(html, /hreflang="x-default" href="https:\/\/jevm.ai\/"/);
  assert.match(html, /href="\/zh\/" lang="zh-CN"/);
  assert.ok(!/navigator\.language|localStorage/.test(html));
});

test('planet picking matches visible sphere depth at grazing and overlapping positions', async () => {
  const model = await import('../jevm-site/assets/orbit-model.mjs');
  assert.equal(typeof model.pickPlanet, 'function', 'Picking needs the same ray/sphere depth test as rendering');
  for (const [seconds, width, height] of [[28, 1000, 490], [79, 1000, 490], [73.4, 343, 340]]) {
    const positions = Array.from({ length: 5 }, (_, i) => model.orbitPosition(i, seconds));
    const point = model.projectPosition(positions[4], [-0.17, 0.32], width, height, 6.8);
    assert.equal(model.pickPlanet(point.x, point.y, positions, [-0.17, 0.32], width, height, 6.8), 4);
  }
  assert.equal(model.projectPosition(model.orbitPosition(4, 28), [-0.17, 0.32], 1000, 490, 6.8).occluded, false);
  assert.equal(model.pickPlanet(0, 0, Array.from({ length: 5 }, (_, i) => model.orbitPosition(i, 0)), [-0.17, 0.32], 1000, 490, 6.8), -1);
});

test('scene uniforms do not shadow GLSL built-in functions', async () => {
  const script = await readFile(new URL('../jevm-site/assets/universe.js', import.meta.url), 'utf8');
  assert.doesNotMatch(script, /uniform\s+\w+\s+(step|mix|noise|normalize|length)\s*;/);
});

test('all planet halos respect solid depth and share the paused scene clock', async () => {
  const script = await readFile(new URL('../jevm-site/assets/universe.js', import.meta.url), 'utf8');
  const halos = script.match(/\/\/ Planet halos[\s\S]*?(?=\/\/ Two intersecting)/)?.[0];
  assert.ok(halos, 'Render halos after all solid planets have resolved their depth');
  assert.match(halos, /for \(int i = 0; i < 5; i\+\+\)/);
  assert.match(halos, /auraDepth > 0\.0 && auraDepth < depth/);
  assert.match(halos, /ringDepth > 0\.0 && ringDepth < depth/);
  assert.match(halos, /phase - time \*/);
  assert.match(script, /uniform float highlighted;/);
  assert.match(script, /gl\.uniform1f\(uniforms\.highlighted,/);
});

test('every asset selector shares halos with selected and keyboard focus states', async () => {
  const css = await readFile(new URL('../jevm-site/assets/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.planet-swatch::before\s*\{/);
  assert.match(css, /\.planet-swatch::after\s*\{/);
  assert.match(css, /\.market-node:focus-visible \.planet-swatch::after/);
  assert.match(css, /\.market-node\[aria-pressed="true"\] \.planet-swatch::after/);
  assert.doesNotMatch(css, /\.node-derivatives \.planet-swatch::after/);
});

test('mobile execution label reserves a separate row above asset controls', async () => {
  const css = await readFile(new URL('../jevm-site/assets/styles.css', import.meta.url), 'utf8');
  const mobile = css.split('@media (max-width: 600px) {')[1].split('@media (max-width: 380px) {')[0];
  const label = mobile.match(/\.execution-orbit-label\s*\{([^}]+)\}/)?.[1];
  assert.match(label, /position:\s*relative;/, 'The label must contribute its own height instead of covering the selectors');
  assert.match(label, /top:\s*auto;/);
  assert.match(label, /left:\s*auto;/);
  assert.match(label, /transform:\s*none;/);
  assert.match(label, /margin:\s*0 auto 12px;/, 'Keep a clear gap above the asset controls');
  const script = await readFile(new URL('../jevm-site/assets/universe.js', import.meta.url), 'utf8');
  assert.match(script, /if \(mobile\.matches\)\s*\{\s*executionLabel\.removeAttribute\('style'\);\s*\} else \{[\s\S]*?executionLabel\.style\.left[\s\S]*?executionLabel\.style\.top/,
    'Mobile must clear desktop projection offsets, including after resizing');
});
