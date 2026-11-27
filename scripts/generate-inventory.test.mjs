import assert from 'node:assert/strict';
import test from 'node:test';
import { renderInventory } from './generate-inventory.mjs';

test('renders source content, navigation and expandable scenarios without executing HTML', () => {
  const source = [
    '# Inventário',
    '',
    '**Referência:** hoje.',
    '',
    '## Resumo',
    '',
    '| Área | Total |',
    '| --- | --- |',
    '| Testes | 1 |',
    '',
    '## Cenários implementados',
    '',
    '### Cadastro <script>',
    '',
    '1. Cenário [fonte](../tests/example.ts).',
  ].join('\n');
  const template = '<nav><!-- INVENTORY_NAV --></nav><main><!-- INVENTORY_CONTENT --></main>';
  const html = renderInventory(source, template);

  assert.match(html, /<strong>Referência:<\/strong> hoje/);
  assert.match(html, /href="#section-1">Resumo<\/a>/);
  assert.match(html, /<div class="table-wrap"><table>/);
  assert.match(html, /<details><summary>Cadastro &lt;script&gt;<\/summary>/);
  assert.match(html, /href="\.\.\/tests\/example\.ts"/);
  assert.doesNotMatch(html, /<script>/);
});

test('renders the same output with Windows or Unix line endings', () => {
  const source = '# Inventário\n\n## Resumo\n\nTexto.\n';
  const template = '<nav><!-- INVENTORY_NAV --></nav>\n<main><!-- INVENTORY_CONTENT --></main>\n';
  assert.equal(
    renderInventory(source.replaceAll('\n', '\r\n'), template.replaceAll('\n', '\r\n')),
    renderInventory(source, template),
  );
});
