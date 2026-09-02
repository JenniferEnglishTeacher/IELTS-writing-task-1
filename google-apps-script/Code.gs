/**
 * Secure review + Google Docs logging bridge.
 * Script Properties required: OPENAI_API_KEY, STUDENT_ACCESS_CODE
 * Optional: LOG_DOCUMENT_ID, OPENAI_MODEL (default: gpt-5.4-mini)
 */
function doGet() {
  return json_({ ok: true, service: 'IELTS Writing Review' });
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents || '{}');
    var props = PropertiesService.getScriptProperties();
    var expectedCode = props.getProperty('STUDENT_ACCESS_CODE');
    if (!expectedCode || payload.accessCode !== expectedCode) {
      return json_({ error: 'Invalid class/access code.' });
    }
    if (!payload.studentName || !payload.graph || !payload.answers) {
      return json_({ error: 'Missing submission details.' });
    }
    var review = callOpenAI_(payload, props);
    var docId = appendToLog_(payload, review, props);
    review.saved = true;
    review.documentId = docId;
    return json_(review);
  } catch (error) {
    return json_({ error: String(error.message || error), saved: false });
  }
}

function callOpenAI_(payload, props) {
  var apiKey = props.getProperty('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured.');
  var structure = ['Introduction','Two general trends','Upward trend','Downward trend','Fluctuation','Conclusion and cautious indication'];
  var prompt = [
    'You are an IELTS Academic Writing Task 1 teacher.',
    'Review the student response against the supplied graph facts only. Never invent precise values.',
    'Preserve the six-section structure and produce a concise JSON response.',
    'Return JSON with keys: score (0-9 number), summary (string with grammar, data accuracy, task achievement and next step), model (a six-paragraph model using the same broad sentence patterns).',
    'Note: a speculative conclusion is not normally required in IELTS Task 1; if included, it must be carefully hedged and grounded in the visible trend.',
    'Graph: ' + JSON.stringify(payload.graph),
    'Student answers: ' + JSON.stringify(payload.answers),
    'Selected pattern numbers: ' + JSON.stringify(payload.patterns || {}),
    'Required structure: ' + structure.join('; ')
  ].join('\n');
  var response = UrlFetchApp.fetch('https://api.openai.com/v1/responses', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + apiKey },
    payload: JSON.stringify({
      model: props.getProperty('OPENAI_MODEL') || 'gpt-5.4-mini',
      store: false,
      input: prompt,
      text: { format: { type: 'json_schema', name: 'ielts_review', strict: true, schema: { type:'object', additionalProperties:false, properties:{ score:{type:'number'}, summary:{type:'string'}, model:{type:'string'} }, required:['score','summary','model'] } } }
    })
  });
  var body = JSON.parse(response.getContentText());
  if (response.getResponseCode() >= 300) throw new Error(body.error && body.error.message || 'OpenAI request failed.');
  var text = body.output_text || (body.output || []).reduce(function(acc,item){return acc.concat((item.content||[]).map(function(c){return c.text||'';}));},[]).join('');
  return JSON.parse(text);
}

function appendToLog_(payload, review, props) {
  var id = props.getProperty('LOG_DOCUMENT_ID');
  var doc = id ? DocumentApp.openById(id) : DocumentApp.create('IELTS Writing Task 1 — Student Practice Log');
  if (!id) props.setProperty('LOG_DOCUMENT_ID', doc.getId());
  var body = doc.getBody();
  body.appendHorizontalRule();
  body.appendParagraph(payload.studentName + ' — Graph ' + payload.graph.id + ': ' + payload.graph.title).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'));
  var labels = {introduction:'1. Introduction',overview:'2. Two general trends',upward:'3. Upward trend',downward:'4. Downward trend',fluctuation:'5. Fluctuation',conclusion:'6. Conclusion / indication'};
  Object.keys(labels).forEach(function(key){ body.appendParagraph(labels[key]).setHeading(DocumentApp.ParagraphHeading.HEADING2); body.appendParagraph(payload.answers[key] || '—'); });
  body.appendParagraph('AI feedback').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph('Estimated band: ' + review.score + '\n' + review.summary);
  body.appendParagraph('Model response').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(review.model);
  doc.saveAndClose();
  return doc.getId();
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
