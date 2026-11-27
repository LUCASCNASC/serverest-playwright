import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';

export function renderInventory(source, template) {
  const md = new MarkdownIt({ html: false });
  const tokens = md.parse(source, {});
  const sections = [];
  const intro = [];
  let current;
  let detail;

  function render(parts) {
    return md.renderer.render(parts, md.options, {});
  }

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.type === 'heading_open' && token.tag === 'h1') {
      index += 2;
    } else if (token.type === 'heading_open' && token.tag === 'h2') {
      const heading = tokens[index + 1].content;
      current = { heading, id: `section-${sections.length + 1}`, parts: [] };
      sections.push(current);
      detail = undefined;
      index += 2;
    } else if (current && current.heading === 'Cenários implementados'
      && token.type === 'heading_open' && token.tag === 'h3') {
      detail = { heading: tokens[index + 1].content, parts: [] };
      current.parts.push(detail);
      index += 2;
    } else {
      (detail ? detail.parts : current ? current.parts : intro).push(token);
    }
  }

  const nav = sections.map(({ heading, id }) =>
    `<a href="#${id}">${md.utils.escapeHtml(heading)}</a>`).join('');
  const content = sections.map(({ heading, id, parts }) => {
    const blocks = [];
    let pending = [];
    const flush = () => {
      if (pending.length) blocks.push(render(pending));
      pending = [];
    };
    for (const part of parts) {
      if (part.type) {
        pending.push(part);
      } else {
        flush();
        blocks.push(`<details><summary>${md.utils.escapeHtml(part.heading)}</summary><div class="detail-body">${render(part.parts)}</div></details>`);
      }
    }
    flush();
    return `<section id="${id}"><h2>${md.utils.escapeHtml(heading)}</h2>${blocks.join('')}</section>`;
  }).join('\n');

  return template.replace(/\r\n/g, '\n').replace('<!-- INVENTORY_NAV -->', nav)
    .replace('<!-- INVENTORY_CONTENT -->', `<div class="intro">${render(intro)}</div>${content}`)
    .replaceAll('<table>', '<div class="table-wrap"><table>')
    .replaceAll('</table>', '</table></div>');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const source = path.join(root, 'docs', 'INVENTARIO_CENARIOS.md');
  const output = path.join(root, 'docs', 'INVENTARIO_CENARIOS.html');
  const template = fs.readFileSync(path.join(root, 'scripts', 'inventory-template.html'), 'utf8');
  const html = renderInventory(fs.readFileSync(source, 'utf8'), template);
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== html) {
      throw new Error('Inventory HTML is out of date. Run npm run inventory.');
    }
  } else {
    fs.writeFileSync(output, html);
  }
}
