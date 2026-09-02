# IELTS Graph Writing Studio

An expandable, mobile-friendly Writing Task 1 practice site for Jennifer's students. The first collection contains 20 increase/decrease/fluctuation graphs and six guided writing sections.

## What students can do

- Browse and search all graphs from a dashboard.
- Open each graph at `#/graph/1`, `#/graph/2`, and so on.
- Choose one of ten sentence patterns in each of six sections.
- Draft with automatic saving in the browser.
- Run immediate offline grammar and structure checks.
- Receive secure AI feedback and a model response when the teacher bridge is configured.
- Submit the complete attempt to a teacher-owned Google Doc.

## Add another graph

1. Put the image in `assets/graphs/` using the next sequential name, for example `g21.jpg`.
2. Add one object to the `GRAPHS` array in `data.js` with the next `id`.
3. Include `title`, `years`, `metric`, `tags`, `prompt`, `hint`, and six `sample` paragraphs.

The dashboard and route are generated automatically.

## Secure AI + Google Drive setup

GitHub Pages is public and must never contain an API key. The included Google Apps Script acts as the private bridge.

1. In Google Drive, create a new Apps Script project.
2. Copy `google-apps-script/Code.gs` into its editor.
3. In **Project Settings → Script Properties**, add:
   - `OPENAI_API_KEY`: the teacher's API key
   - `STUDENT_ACCESS_CODE`: a private class code shared with trusted students
   - `OPENAI_MODEL`: optional; defaults to `gpt-5.4-mini`
   - `LOG_DOCUMENT_ID`: optional; if omitted, the first submission creates the log document automatically
4. Deploy as **Web app**. Execute as yourself and allow access to anyone with the link (the private class code still gates submissions).
5. Copy the deployment URL into `SITE_CONFIG.reviewEndpoint` at the bottom of `data.js`.
6. Redeploy the GitHub Pages site.

Do not place `OPENAI_API_KEY` or the class code in `data.js`.

## GitHub Pages

In the GitHub repository, open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save. The public URL will be:

`https://jenniferenglishteacher.github.io/IELTS-writing-task-1/`

## Local preview

Open a terminal in this folder and run any simple static web server, then visit the local address in Chrome or Edge. The site has no build step or external package dependency.

## Teaching note

IELTS Academic Task 1 normally prioritizes an introduction, overview, and factual detail paragraphs; a speculative conclusion is not required. Section 6 is kept because it is part of the supplied teaching framework, but its prompts explicitly require cautious, data-grounded language.
