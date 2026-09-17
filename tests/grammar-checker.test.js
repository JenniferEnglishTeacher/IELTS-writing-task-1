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
check(
  'The two chart compares the using of AI technologies between 2024 and 2025, one broke down by enterprises size, one by country.',
  'The two charts compare the use of AI technologies between 2024 and 2025, one broken down by enterprise size and the other by country.',
  ['Noun number', 'Subject–verb agreement', 'Word form', 'Verb form', 'Noun form', 'Parallel sentence structure']
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
check('There was a increase and a sharply decline.', 'There was an increase and a sharp decline.', ['Article', 'Word form']);
check('The figure reached to 40%.', 'The figure reached 40%.', ['Verb form']);
check('It was the most highest figure.', 'It was the highest figure.', ['Comparison']);

const valid = analyse('The line graph illustrates weekly admissions to five hospitals in a European country from 2004 to 2018.');
assert.equal(valid.issues.filter(issue => issue.kind === 'grammar').length, 0, 'A correct introduction must not receive a grammar correction.');

const compoundNoun = analyse('The two bar charts compare AI use in European enterprises in 2024 and 2025.');
assert.equal(compoundNoun.issues.filter(issue => issue.kind === 'grammar').length, 0, 'A noun modifier in “two bar charts” must remain singular.');
assert.equal(compoundNoun.correctedSentence, 'The two bar charts compare AI use in European enterprises in 2024 and 2025.');

console.log('Grammar checker regression tests passed.');
