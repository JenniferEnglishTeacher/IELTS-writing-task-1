(function (root) {
  'use strict';

  const TREND_BASE = {
    rose: 'rise', risen: 'rise', rises: 'rise',
    fell: 'fall', fallen: 'fall', falls: 'fall',
    increased: 'increase', increases: 'increase',
    decreased: 'decrease', decreases: 'decrease',
    declined: 'decline', declines: 'decline',
    climbed: 'climb', climbs: 'climb',
    dropped: 'drop', drops: 'drop',
    grew: 'grow', grown: 'grow', grows: 'grow',
    fluctuated: 'fluctuate', fluctuates: 'fluctuate'
  };

  const PAST_PARTICIPLE = {
    rose: 'risen', fell: 'fallen', went: 'gone', grew: 'grown',
    increase: 'increased', decrease: 'decreased', decline: 'declined',
    climb: 'climbed', drop: 'dropped', fluctuate: 'fluctuated'
  };

  const THIRD_PERSON = {
    illustrate: 'illustrates', show: 'shows', compare: 'compares',
    depict: 'depicts', demonstrate: 'demonstrates', present: 'presents',
    give: 'gives', rise: 'rises', fall: 'falls', increase: 'increases',
    decrease: 'decreases', decline: 'declines', climb: 'climbs',
    drop: 'drops', grow: 'grows', fluctuate: 'fluctuates'
  };

  const BASE_FORM = {
    illustrates: 'illustrate', shows: 'show', compares: 'compare',
    depicts: 'depict', demonstrates: 'demonstrate', presents: 'present',
    gives: 'give', rises: 'rise', falls: 'fall', increases: 'increase',
    decreases: 'decrease', declines: 'decline', climbs: 'climb',
    drops: 'drop', grows: 'grow', fluctuates: 'fluctuate'
  };

  const ADJECTIVE_FORM = {
    sharply: 'sharp', dramatically: 'dramatic', significantly: 'significant',
    considerably: 'considerable', steadily: 'steady', gradually: 'gradual',
    slightly: 'slight', rapidly: 'rapid'
  };

  const MISSPELLINGS = {
    comparision: 'comparison', comparisions: 'comparisons',
    begining: 'beginning', occured: 'occurred', untill: 'until',
    seperate: 'separate', signifantly: 'significantly',
    significently: 'significantly', dramaticly: 'dramatically',
    gradualy: 'gradually', sharpely: 'sharply', flucuated: 'fluctuated',
    flactuated: 'fluctuated', ilustrates: 'illustrates',
    illustates: 'illustrates', ilustrate: 'illustrate',
    percantage: 'percentage', precentage: 'percentage',
    goverment: 'government', enviroment: 'environment',
    fourty: 'forty', wich: 'which', throught: 'throughout'
  };

  const PLURAL_NOUNS = {
    hospital: 'hospitals', city: 'cities', country: 'countries',
    category: 'categories', group: 'groups', year: 'years', month: 'months',
    student: 'students', tourist: 'tourists', patient: 'patients',
    clinic: 'clinics', attraction: 'attractions', car: 'cars', region: 'regions',
    source: 'sources', language: 'languages', sector: 'sectors',
    person: 'people', line: 'lines', bar: 'bars', figure: 'figures',
    graph: 'graphs', chart: 'charts', table: 'tables', diagram: 'diagrams',
    enterprise: 'enterprises', technology: 'technologies', percentage: 'percentages'
  };

  function matchCase(source, replacement) {
    if (source === source.toUpperCase()) return replacement.toUpperCase();
    if (/^[A-Z]/.test(source)) return replacement[0].toUpperCase() + replacement.slice(1);
    return replacement;
  }

  function analyse(text, context) {
    context = context || {};
    let corrected = String(text || '').trim();
    const issues = [];
    const seen = new Set();

    function add(category, original, replacement, explanation, kind) {
      const key = [category, original, replacement].join('|').toLowerCase();
      if (seen.has(key) || original === replacement) return;
      seen.add(key);
      issues.push({ category, original, corrected: replacement, explanation, kind: kind || 'grammar' });
    }

    function apply(regex, replacement, category, explanation, kind) {
      corrected = corrected.replace(regex, function () {
        const args = Array.from(arguments);
        const original = args[0];
        const next = typeof replacement === 'function' ? replacement.apply(null, args) : replacement;
        add(category, original, next, typeof explanation === 'function' ? explanation(original, next) : explanation, kind);
        return next;
      });
    }

    if (!corrected) {
      return { issues: [{ category: 'Sentence structure', original: '(empty)', corrected: 'Write a complete sentence.', explanation: 'A response needs a subject and a finite verb.', kind: 'grammar' }], correctedSentence: '' };
    }

    // Capitalisation and final punctuation.
    if (/^[a-z]/.test(corrected)) {
      const original = corrected[0];
      const replacement = original.toUpperCase();
      add('Punctuation', original, replacement, 'Begin a sentence with a capital letter.');
      corrected = replacement + corrected.slice(1);
    }
    apply(/\s+([,.;:!?])/g, '$1', 'Punctuation', 'Do not put a space before punctuation.');
    apply(/([!?.,])\1+/g, '$1', 'Punctuation', 'Use one punctuation mark here.');
    if (!/[.!?]$/.test(corrected)) {
      add('Punctuation', '(missing final punctuation)', '.', 'End a complete sentence with suitable punctuation.');
      corrected += '.';
    }

    // High-confidence contextual word-form and spelling rules.
    apply(/\b(give)(?=\s+(?:(?:line|bar)\s+)?(?:graph|chart)\b)/gi,
      (m) => matchCase(m, 'given'), 'Spelling / word form',
      'Use the past participle “given” as the adjective before “graph” or “chart”.');
    Object.keys(MISSPELLINGS).forEach(function (wrong) {
      apply(new RegExp('\\b' + wrong + '\\b', 'gi'),
        (m) => matchCase(m, MISSPELLINGS[wrong]), 'Spelling',
        'Correct the spelling of this word.');
    });
    apply(/\binformations\b/gi, (m) => matchCase(m, 'information'), 'Word form', '“Information” is uncountable in English.');
    apply(/\bdatas\b/gi, (m) => matchCase(m, 'data'), 'Word form', 'Use “data”, not “datas”.');
    apply(/\bthe using of\b/gi, (m) => matchCase(m, 'the use of'), 'Word form', 'Use the noun “use” after “the”; “using” is a verb form.');
    apply(/\b(one|which|that|it|was|were|is|are)\s+broke down\b/gi,
      (m, lead) => lead + ' broken down', 'Verb form', 'Use the past participle “broken” in the passive phrase “broken down”.');
    apply(/\b(enterprises|companies)\s+(size|category|type)\b/gi,
      (m, noun, label) => noun.toLowerCase() === 'companies' ? 'company ' + label : 'enterprise ' + label,
      'Noun form', 'Use a singular noun as a modifier before another noun: “enterprise size”.');

    // Number and noun agreement.
    const countNouns = Object.keys(PLURAL_NOUNS).join('|');
    const compoundHeads = 'admissions?|clinics?|data|figures?|categories|charts?|graphs?|tables?|diagrams?|sizes?|classes|types?|technologies|use|users';
    apply(new RegExp('\\b(2|3|4|5|6|7|8|9|10|[1-9]\\d+)\\s+(' + countNouns + ')\\b(?!\\s+(?:' + compoundHeads + ')\\b)', 'gi'),
      (m, number, noun) => number + ' ' + matchCase(noun, PLURAL_NOUNS[noun.toLowerCase()]),
      'Noun number', 'A count noun must be plural after a number greater than one.');
    apply(new RegExp('\\b(two|three|four|five|six|seven|eight|nine|ten|many|several|both)\\s+(' + countNouns + ')\\b(?!\\s+(?:' + compoundHeads + ')\\b)', 'gi'),
      (m, number, noun) => number + ' ' + matchCase(noun, PLURAL_NOUNS[noun.toLowerCase()]),
      'Noun number', 'Use a plural count noun after this determiner.');
    const smallNumbers = {2:'two',3:'three',4:'four',5:'five',6:'six',7:'seven',8:'eight',9:'nine',10:'ten'};
    apply(/\b(2|3|4|5|6|7|8|9|10)\s+(hospitals|cities|countries|categories|groups|years|months|students|tourists|patients|clinics|attractions|cars|regions|sources|languages|sectors|lines|bars|figures|graphs|charts|tables|diagrams|enterprises|technologies|percentages)\b/gi,
      (m, number, noun) => smallNumbers[number] + ' ' + noun,
      'Academic style', 'In formal prose, small whole numbers are usually written as words.', 'style');
    apply(/\b(one|each|every)\s+(hospitals|cities|countries|categories|groups|years|months|students|tourists|patients|clinics|attractions|cars|regions|sources|languages|sectors|lines|bars|figures)\b/gi,
      (m, determiner, noun) => determiner + ' ' + noun.replace(/ies$/i, 'y').replace(/s$/i, ''),
      'Noun number', 'Use a singular count noun after “one”, “each”, or “every”.');

    // Subject–verb agreement in graph-reporting clauses.
    apply(/\b(graph|chart|figure|table|diagram)\s+(illustrate|show|compare|depict|demonstrate|present|give)\b/gi,
      (m, subject, verb) => subject + ' ' + matchCase(verb, THIRD_PERSON[verb.toLowerCase()]),
      'Subject–verb agreement', 'A singular subject such as “graph” takes a third-person singular verb.');
    apply(/\b(graphs|charts|figures|tables|diagrams)\s+(illustrates|shows|compares|depicts|demonstrates|presents|gives)\b/gi,
      (m, subject, verb) => subject + ' ' + BASE_FORM[verb.toLowerCase()],
      'Subject–verb agreement', 'A plural subject takes the base form of the verb.');
    apply(/\b(people|students|tourists|patients|figures|admissions|sales|categories)\s+(is|was|has)\b/gi,
      (m, subject, verb) => subject + ' ' + ({is:'are',was:'were',has:'have'}[verb.toLowerCase()]),
      'Subject–verb agreement', 'This plural subject requires a plural verb.');
    apply(/\b(the (?:number|percentage|proportion|figure|rate|amount) of [^,.;]+?)\s+were\b/gi,
      (m, subject) => subject + ' was', 'Subject–verb agreement',
      'The head noun is singular, so use “was”.');
    apply(/\ba number of ([^,.;]+?)\s+was\b/gi,
      (m, subject) => 'a number of ' + subject + ' were', 'Subject–verb agreement',
      '“A number of” means several and normally takes a plural verb.');

    // Verb forms after auxiliaries, modals and infinitives.
    apply(/\b(did|did not|didn't)\s+(rose|fell|grew|increased|decreased|declined|climbed|dropped|fluctuated)\b/gi,
      (m, aux, verb) => aux + ' ' + (TREND_BASE[verb.toLowerCase()] || verb),
      'Verb form', 'Use the base form after “did”.');
    apply(/\b(can|could|may|might|must|should|will|would)\s+(rose|fell|grew|increased|decreased|declined|climbed|dropped|fluctuated|rises|falls|grows|increases|decreases|declines|climbs|drops|fluctuates)\b/gi,
      (m, modal, verb) => modal + ' ' + (TREND_BASE[verb.toLowerCase()] || verb),
      'Verb form', 'Use the base form after a modal verb.');
    apply(/\bto\s+(rose|fell|grew|increased|decreased|declined|climbed|dropped|fluctuated)\b/gi,
      (m, verb) => 'to ' + (TREND_BASE[verb.toLowerCase()] || verb),
      'Verb form', 'Use the base form after infinitive “to”.');
    apply(/\b(has|have|had)\s+(rose|fell|went|grew|rise|fall|go|grow|increase|decrease|decline|climb|drop|fluctuate)\b/gi,
      (m, aux, verb) => aux + ' ' + (PAST_PARTICIPLE[verb.toLowerCase()] || (verb + 'd')),
      'Verb form', 'Use a past participle after “has”, “have”, or “had”.');
    apply(/\b(is|are|was|were)\s+(show|illustrate|compare|present)\b/gi,
      (m, aux, verb) => aux + ' ' + ({show:'shown',illustrate:'illustrated',compare:'compared',present:'presented'}[verb.toLowerCase()]),
      'Verb form', 'A passive construction needs a past participle after “be”.');
    apply(/\b(a)\s+(increase|upward trend|overall rise)\b/gi,
      (m, article, noun) => matchCase(article, 'an') + ' ' + noun,
      'Article', 'Use “an” before a word that begins with a vowel sound.');
    apply(/\b(an)\s+(rise|fall|drop|decline|change|chart|graph)\b/gi,
      (m, article, noun) => matchCase(article, 'a') + ' ' + noun,
      'Article', 'Use “a” before a word that begins with a consonant sound.');
    apply(/\b(rose|fell|grew|increased|decreased|declined|climbed|dropped|fluctuated)\s+(sharp|dramatic|significant|considerable|steady|gradual|slight|rapid)\b/gi,
      (m, verb, adjective) => verb + ' ' + adjective + 'ly',
      'Word form', 'Use an adverb to describe how a verb changed.');
    apply(/\b(a|an)\s+(sharply|dramatically|significantly|considerably|steadily|gradually|slightly|rapidly)\s+(increase|decrease|rise|fall|drop|decline)\b/gi,
      (m, article, adverb, noun) => article + ' ' + ADJECTIVE_FORM[adverb.toLowerCase()] + ' ' + noun,
      'Word form', 'Use an adjective—not an adverb—to modify a noun.');
    apply(/\breached to\b/gi, (m) => matchCase(m, 'reached'), 'Verb form', '“Reach” takes a direct object; do not add “to”.');
    apply(/\b(one of the)\s+(country|city|category|group|enterprise|figure|year)\b/gi,
      (m, lead, noun) => lead + ' ' + PLURAL_NOUNS[noun.toLowerCase()],
      'Noun number', 'Use a plural noun after “one of the”.');
    apply(/\b(more)\s+(higher|lower|larger|smaller|greater|fewer)\b/gi,
      (m, extra, comparative) => comparative, 'Comparison', 'Do not use “more” with an adjective that is already comparative.');
    apply(/\b(most)\s+(highest|lowest|largest|smallest|greatest)\b/gi,
      (m, extra, superlative) => superlative, 'Comparison', 'Do not use “most” with an adjective that is already superlative.');

    // Tense in explicit completed-year clauses (the reporting verb “shows/illustrates” stays present).
    apply(/\b(In\s+(?:19\d{2}|20(?:0\d|1\d|2[0-5]))\s*,\s*[^,.;]{0,60}?)\b(rise|rises|fall|falls|increase|increases|decrease|decreases|decline|declines|climb|climbs|drop|drops|grow|grows)\b/gi,
      (m, lead, verb) => lead + ({rise:'rose',rises:'rose',fall:'fell',falls:'fell',increase:'increased',increases:'increased',decrease:'decreased',decreases:'decreased',decline:'declined',declines:'declined',climb:'climbed',climbs:'climbed',drop:'dropped',drops:'dropped',grow:'grew',grows:'grew'}[verb.toLowerCase()]),
      'Verb tense', 'Use the past tense for a change completed in a stated past year.');

    // Relative clauses and reduced relative clauses.
    apply(/\b(people|students|tourists|patients|men|women)\s+which\b/gi,
      (m, noun) => noun + ' who', 'Relative clause', 'Use “who” for people in a relative clause.');
    apply(/\b(graph|chart|figure|table|category|line|bar|hospital|city|country|enterprise|company|technology)\s+who\b/gi,
      (m, noun) => noun + ' which', 'Relative clause', 'Use “which” or “that” for a thing, not “who”.');
    apply(/\b(which|that|who)\s+(it|they|he|she)\s+/gi,
      (m, relative) => relative + ' ', 'Relative clause', 'Do not repeat the subject after a relative pronoun.');
    apply(/\b(hospitals|cities|countries|regions|groups|categories)\s+that\s+(?:are|were)\s+in\b/gi,
      (m, noun) => noun + ' in', 'Relative clause',
      'This relative clause is grammatical but unnecessarily wordy; reduce it to a prepositional phrase.', 'style');

    // Participle clauses (分詞構句).
    apply(/,\s+(it|they|this|these)\s+(increasing|decreasing|rising|falling|climbing|dropping)\b/gi,
      (m, subject, participle) => ', ' + participle, 'Participle clause 分詞構句',
      'Do not add a separate subject inside a participle clause that refers to the main-clause subject.');
    apply(/\b(before|after)\s+(rose|fell|grew|increased|decreased|declined|climbed|dropped)\b/gi,
      (m, linker, verb) => linker + ' ' + ({rose:'rising',fell:'falling',grew:'growing',increased:'increasing',decreased:'decreasing',declined:'declining',climbed:'climbing',dropped:'dropping'}[verb.toLowerCase()]),
      'Participle clause 分詞構句', 'After “before” or “after”, use an -ing form when no subject is stated.');
    apply(/\bfollowed by (increased|decreased)\b/gi,
      (m, verb) => 'followed by an ' + (verb.toLowerCase()==='increased'?'increase':'decrease'),
      'Participle clause 分詞構句', 'After “followed by”, use a noun phrase here.');
    apply(/^(Increased|Decreased|Rose|Fell|Climbed|Dropped)\s+from\b/i,
      (m, verb) => 'The figure ' + matchCase(verb, verb.toLowerCase()),
      'Sentence structure', 'The sentence fragment needs a subject.');
    apply(/^(Rising|Falling|Increasing|Decreasing)[^,]{0,60},\s+the (graph|chart) (shows|illustrates)\b/i,
      (m, participle, noun, verb) => 'The ' + noun + ' ' + verb,
      'Participle clause 分詞構句', 'The graph itself does not rise or fall; make the changing category the subject of the participle clause.');

    // Paired conjunctions and common linker errors.
    apply(/\bfrom\s+((?:19|20)\d{2}|\d+(?:\.\d+)?%?)\s+and\s+((?:19|20)\d{2}|\d+(?:\.\d+)?%?)\b/gi,
      (m, first, second) => 'from ' + first + ' to ' + second,
      'Conjunction / preposition', 'Use the paired form “from … to …”.');
    apply(/\bbetween\s+((?:19|20)\d{2}|\d+(?:\.\d+)?%?)\s+to\s+((?:19|20)\d{2}|\d+(?:\.\d+)?%?)\b/gi,
      (m, first, second) => 'between ' + first + ' and ' + second,
      'Conjunction / preposition', 'Use the paired form “between … and …”.');
    apply(/\bboth\s+([^,.;]{1,40}?)\s+as well as\s+([^,.;]{1,40})/gi,
      (m, first, second) => 'both ' + first + ' and ' + second,
      'Conjunction', 'Use the paired conjunction “both … and …”.');
    apply(/\b(Although|Though)\s+([^.;]+?),?\s+but\s+/gi,
      (m, linker, clause) => linker + ' ' + clause + ', ',
      'Conjunction', 'Do not use “although/though” and “but” for the same contrast.');
    apply(/\bBecause\s+([^.;]+?),\s+so\s+/gi,
      (m, clause) => 'Because ' + clause + ', ',
      'Conjunction', 'Do not use “because” and “so” together in this structure.');
    apply(/,\s*one broken down by\s+([^,.;]+),\s*one by\s+([^.;]+)([.!?]?)$/gi,
      (m, first, second, punctuation) => ', one broken down by ' + first.trim() + ' and the other by ' + second.trim() + punctuation,
      'Parallel sentence structure', 'Use the parallel pair “one … and the other …” to distinguish the two charts.');

    // Punctuation patterns after sentence grammar is normalised.
    apply(/\b(Overall|However|Nevertheless|Moreover|Therefore)\s+(?!,)/gi,
      (m, linker) => linker + ', ', 'Punctuation', 'Use a comma after this sentence adverb.');
    apply(/\b(In contrast|By contrast|In comparison)\s+(?!,)/gi,
      (m, linker) => linker + ', ', 'Punctuation', 'Use a comma after this linking phrase.');
    apply(/\b(graph|chart|figure|table),\s+(illustrates|shows|compares|depicts|presents)\b/gi,
      (m, subject, verb) => subject + ' ' + verb, 'Punctuation', 'Do not place a comma between a subject and its verb.');
    apply(/\b(country|city|cities|countries|period),\s+(from|between)\b/gi,
      (m, noun, preposition) => noun + ' ' + preposition, 'Punctuation', 'This time phrase is essential here, so the comma is unnecessary.');
    apply(/,\s+(it|they|he|she|this|these)\s+(rose|fell|grew|increased|decreased|declined|climbed|dropped|was|were|is|are)\b/gi,
      (m, subject, verb) => '; ' + subject + ' ' + verb, 'Sentence structure', 'Two independent clauses cannot be joined by a comma alone; use a semicolon, a full stop, or a conjunction.');
    apply(/\b(The (?:graph|chart|figure|table))\s+it\s+(shows|illustrates|compares|depicts|presents)\b/gi,
      (m, subject, verb) => subject + ' ' + verb, 'Sentence structure', 'Do not use both a noun subject and a repeated pronoun subject.');
    apply(/\bThere (?:have|has) (an? (?:increase|decrease|rise|fall|change))\b/gi,
      (m, nounPhrase) => 'There was ' + nounPhrase, 'Sentence structure', 'Use “there was/there were”, not “there have/has”, to introduce this noun phrase.');

    // IELTS-specific high-confidence wording improvements are labelled separately from grammar.
    apply(/\b(the )?hospital admissions for\b/gi,
      (m) => (/^the /i.test(m) ? '' : '') + 'hospital admissions to',
      'IELTS word choice', 'For patients being admitted, “admissions to hospitals” is the natural collocation.', 'style');
    if (/\[[^\]]+\]/.test(corrected)) {
      add('Sentence structure', corrected.match(/\[[^\]]+\]/)[0], '(replace with graph information)', 'Replace every template placeholder before submitting.');
    }
    if ((corrected.match(/\b(?:is|are|was|were|has|have|had|illustrates?|shows?|compares?|rose|fell|increased|decreased|declined|climbed|dropped|grew|fluctuated)\b/gi) || []).length === 0) {
      add('Sentence structure', corrected, '(add a complete subject–verb clause)', 'The response may be a fragment because no finite verb was detected.');
    }
    if (context.sectionId === 'overview' && !/\b(overall|main feature|stand out|in general)\b/i.test(corrected)) {
      add('IELTS overview structure', '(missing overview signal)', 'Overall, …', 'Signal clearly that this sentence reports the main features.', 'style');
    }

    return { issues, correctedSentence: corrected };
  }

  const api = { analyse };
  root.GrammarChecker = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
