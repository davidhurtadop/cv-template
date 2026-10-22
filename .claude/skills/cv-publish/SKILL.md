---
name: cv-publish
description: Publish this CV site on GitHub Pages - run the checks, open a pull request (or push to main), set the Pages source and watch the deployment until the site is live.
when_to_use: The user explicitly asks to deploy, publish, put the CV online, or open a pull request for their changes.
disable-model-invocation: true
allowed-tools: Bash(git status *) Bash(git branch *) Bash(git remote -v) Bash(git log *) Bash(git diff *) Bash(npm test) Bash(npm run validate)
---

# cv-publish

The deployment is `.github/workflows/pages.yml`: on every push to `main` it runs the tests and validation, then publishes `src/`. A change goes live when it reaches `main`.

## How to talk to the user

- **Every decision is a multiple-choice question** with the AskUserQuestion tool: 2 to 4 options, the safest or most useful first and labelled "(Recommended)", a header of at most 12 characters. Never ask "do you want me to...?" as plain text, and never ask two things in one message.
- Pushing, opening a pull request, merging and changing repo settings affect the outside world. Before each, say in one line what will happen, then ask.
- Show progress as a short checklist, one fact per line (for example `✔ Tests: 11 passed`). No long paragraphs, and keep each line under about 80 characters so it does not wrap badly in a terminal.
- If a step fails, say which step, show the error in one or two lines, and offer options for what to do.

## Steps

1. **Checks.** Run `npm test` and `npm run validate`. On errors stop and offer: fix them now (use the `cv-validate` steps), or stop here.
2. **Config.** Read `src/config/site.json`. `owner.github` must be the user's GitHub account and `baseUrl` must match the final URL (`https://<owner>.github.io/<repo>/`, or `https://<owner>.github.io/` for a repo named `<owner>.github.io`). If something is off, ask what to correct.
3. **Git state.** Run `git status`, `git branch --show-current`, `git remote -v`, and for a branch `git log main..HEAD --oneline` and `git diff main --stat`. Report it as a checklist: branch, commits ahead of `main`, files changed, clean or dirty tree. If the tree is dirty, ask: commit everything with a message you propose (Recommended), review the changes first, or stop.
4. **Choose the route** (question): on a branch other than `main`: open a pull request (Recommended), or stop. On `main`: push straight to `main`, which deploys immediately (warn about that), or stop.
5. **Push** (question). Say the exact command and that the repo is public. Options: push now (Recommended), show me the command to run myself, stop here. Run `git push -u origin <branch>` only after a yes.
6. **Pull request.** Write a short title and a body (what changed, how it was checked), then ask how to continue:
   - If `gh` is installed and authenticated: create the PR with `gh pr create --base main --head <branch>` (Recommended), or just show me the text.
   - If `gh` is missing (do not install it): show the compare link `https://github.com/<owner>/<repo>/compare/main...<branch>?expand=1` with the title and body to paste (Recommended), open the link in my browser (`open <url>` on macOS), or stop. Walk the user through: open the link, paste the title and body, click "Create pull request".
   - Say that the deploy does not run on the pull request, only after it is merged into `main`.
7. **Pages source** (question, once per repo): Settings → Pages → Build and deployment → Source must be **GitHub Actions**. Options: already set, show me the click path (Recommended when unsure), check it with `gh` (only when `gh` works), skip for now. The click path is: repo → Settings → Pages → Source → choose GitHub Actions.
8. **Merge** (question). The user decides. Options: I merged it, not merged yet, merge it for me (only when `gh` works; run `gh pr merge` only after an explicit yes). If not yet, tell them to come back and run `/cv-publish` again after merging.
9. **Watch the deployment.** After the merge or push, watch the run (`gh run watch`, or give the Actions tab link `https://github.com/<owner>/<repo>/actions`) and report failures with the failing step and the error.
10. **Done.** Give the live URL, offer to open it (question: open it, no thanks), and remind them that later edits deploy the same way: commit to a branch, open a pull request, merge.
