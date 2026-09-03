const assert = require('node:assert/strict');
const { analyse } = require('../grammar-checker.js');

function check(input, expected, categories) {
  const result = analyse(input, { sectionId: 'introduction' });
  assert.equal(result.correctedSentence, expected, `Unexpected correction for: ${input}`);
  categories.forEach(category => assert.ok(result.issues.some(issue => issue.category === category), `Missing ${category}: ${input}`));
}

check(
  'The give line graph illustrate the hospital admissions for 5 hospital that are in a European country, from 2004 and 2018.',
  'The given line graph illustrates hospital admissions to five hospitals in a European country from 2004 to 2018.',
  ['Spelling / word form', 'Subject–verb agreement', 'Noun number', 'Relative clause', 'Punctuation', 'Conjunction / preposition']
);
check('The graph show the figures', 'The graph shows the figures.', ['Subject–verb agreement', 'Punctuation']);
check('It did increased from 20 to 30.', 'It did increase from 20 to 30.', ['Verb form']);
check('The figure has rose sharply.', 'The figure has risen sharply.', ['Verb form']);
check('In 2010, the figure rise sharply.', 'In 2010, the figure rose sharply.', ['Verb tense']);
check('The students which used AI increased.', 'The students who used AI increased.', ['Relative clause']);
check('After rose to 20%, the figure fell.', 'After rising to 20%, the figure fell.', ['Participle clause 分詞構句']);
check('The value changed between 2000 to 2010.', 'The value changed between 2000 and 2010.', ['Conjunction / preposition']);
check('Although A rose, but B fell.', 'Although A rose, B fell.', ['Conjunction']);
check('The graph, illustrates historical data.', 'The graph illustrates historical data.', ['Punctuation']);
check('The graph ilustrates the data.', 'The graph illustrates the data.', ['Spelling']);
check('The graph it shows the figures.', 'The graph shows the figures.', ['Sentence structure']);

const valid = analyse('The line graph illustrates weekly admissions to five hospitals in a European country from 2004 to 2018.');
assert.equal(valid.issues.filter(issue => issue.kind === 'grammar').length, 0, 'A correct introduction must not receive a grammar correction.');

console.log('Grammar checker regression tests passed.');
