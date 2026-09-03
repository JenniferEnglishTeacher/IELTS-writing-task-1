const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'data.js'), 'utf8');
const context = {};
vm.runInNewContext(`${source}\nglobalThis.__siteData = { GRAPHS, SECTION_DEFINITIONS };`, context);

const { GRAPHS, SECTION_DEFINITIONS } = context.__siteData;
assert.equal(GRAPHS.length, 21, 'The dashboard should contain 21 graph exercises.');
assert.equal(new Set(GRAPHS.map(graph => graph.id)).size, GRAPHS.length, 'Graph IDs must be unique.');

for (const graph of GRAPHS) {
  const sections = graph.sections || SECTION_DEFINITIONS;
  assert.equal(sections.length, 6, `Graph ${graph.id} must contain six guided sections.`);
  assert.equal(graph.sample.length, sections.length, `Graph ${graph.id} needs one model section per guided section.`);
  assert.ok(sections.every(section => section.patterns.length > 0), `Graph ${graph.id} contains an empty pattern group.`);
}

const graph21 = GRAPHS.find(graph => graph.id === 21);
assert.ok(graph21, 'Graph 21 is missing.');
assert.equal(graph21.images.length, 2, 'Graph 21 should show both charts from the source article.');
assert.equal(graph21.sections[3].title, 'Country leaders & gains');
assert.equal(graph21.sections[4].title, 'Lowest figures & contrast');
for (const image of graph21.images) {
  assert.ok(fs.existsSync(path.join(root, image.src)), `Missing Graph 21 image: ${image.src}`);
}

console.log('Site data integrity tests passed.');
