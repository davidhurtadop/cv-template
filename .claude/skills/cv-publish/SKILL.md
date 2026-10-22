---
name: cv-publish
description: Guide the user to send their CV changes to GitHub for review (a pull request), and after it is merged, publish them on the live website (GitHub Pages).
when_to_use: The user explicitly asks to publish, deploy, put the CV online, share their changes, or open a pull request.
disable-model-invocation: true
allowed-tools: Bash(git status *) Bash(git branch *) Bash(git remote -v) Bash(git log *) Bash(git diff *) Bash(git fetch origin) Bash(npm test) Bash(npm run validate)
---

# cv-publish

Two stages: **1. send changes for review**, **2. publish after the merge**. The site updates by itself when the pull request is merged into `main` (`.github/workflows/pages.yml` tests the content and publishes `src/`).

## Style

- Talk like a helpful person, not like a console. Say "your changes", "your website", "send for review". Do the git and npm commands yourself and do not print them unless the user asks or something fails.
- Every decision is an AskUserQuestion with 2 to 4 short options, the best one first and labelled "(Recommended)". One question at a time; never ask choices as plain text.
- Before anything that leaves this computer (upload, pull request, merge, settings), say in one plain sentence what will happen, then ask.
- Progress is a short checklist, one fact per line, under about 80 characters. Errors: say what went wrong in one or two plain lines, then offer options.

## Start

1. Quietly run `npm test` and `npm run validate`. If they pass, show one line: `✔ Your CV passed all checks`. If not, explain the problem simply and offer: fix it now (use the `cv-validate` steps) or stop.
2. Quietly read `src/config/site.json` and `git remote -v`. If `owner.github` does not match the GitHub account in the remote, or `baseUrl` is not `https://<owner>.github.io/<repo>/` (or `https://<owner>.github.io/` for a repo named `<owner>.github.io`), say so in plain words and ask which value to correct.
3. Ask: **"Where are you?"**
   - "Send my changes for review (Recommended)": go to stage 1.
   - "My changes were reviewed and merged": go to stage 2.
   - "Just check my CV": stop after the checks.

## Stage 1: send changes for review

1. Check `git status` and `git branch --show-current`. Show: `✔ Branch: <name>`, `✔ <n> change(s) ready`, `✔ <n> files changed`. If there are uncommitted edits, ask: "Save them with a short description (Recommended)", "Let me look first", "Stop".
2. If the branch is `main`, explain that changes should go through a branch so they can be reviewed, and ask: "Create a branch for me (Recommended)" or "Publish straight to the website without review" (say that it goes live immediately), or "Stop".
3. Ask permission to upload: "This uploads your changes to GitHub (the repository is public). Nothing goes live yet." Options: "Upload them (Recommended)", "Stop". Then push the branch yourself.
4. Write a short, plain title and description for the review (what changed, that checks passed). Then create the pull request:
   - If the GitHub CLI `gh` works (`gh auth status`): ask "Create the review request for me (Recommended)" or "Just give me the text", then run `gh pr create --base main`.
   - If `gh` is not installed (do not install it): offer "Open the GitHub page and copy the description for me (Recommended)" (macOS: `open <link>` and `pbcopy`) or "Just show me the text". The page is `https://github.com/<owner>/<repo>/compare/main...<branch>?expand=1`. Tell the user: paste the description, click the green **Create pull request** button.
5. Finish with: `✔ Sent for review` and what happens next: "When you are happy, click **Merge pull request** on GitHub. Then run /cv-publish again and choose 'merged'." Do not merge it for them unless they ask.

## Stage 2: publish after the merge

1. Bring this computer up to date if needed: run `git fetch origin`; if the user is on the old branch, offer "Switch to the main branch and update it (Recommended)" or "Leave it".
2. **First time only**: ask "Has GitHub Pages been turned on for this repository?" Options: "Yes", "Not sure / show me how (Recommended)", "No". For the last two give the plain steps: open the repository on GitHub, **Settings**, **Pages** in the left menu, under **Source** choose **GitHub Actions**. After that, ask "Done?" before continuing.
3. Check the deployment: with a working `gh`, run `gh run watch`; otherwise open `https://github.com/<owner>/<repo>/actions` for the user and tell them to look for a green check on the latest run ("Deploy to GitHub Pages"). Ask "Is it green?": "Yes", "Still running", "It failed". If it failed, read the failing step and explain it plainly.
4. When it is green, show `✔ Your website is updated` and the address `https://<owner>.github.io/<repo>/`. Ask "Open it now?" with options "Open it (Recommended)", "No thanks".
5. Remind them in one line that later edits work the same way: make changes, run /cv-publish, review, merge.
