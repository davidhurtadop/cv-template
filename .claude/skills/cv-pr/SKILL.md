---
name: cv-pr
description: Send the user's CV changes to GitHub as a pull request so others can review and approve them. Merging the pull request into main publishes the website automatically.
when_to_use: The user asks to open or create a pull request, send changes for review, share their changes, or get their CV online.
disable-model-invocation: true
allowed-tools: Bash(git status *) Bash(git branch *) Bash(git remote -v) Bash(git log *) Bash(git diff *) Bash(npm test) Bash(npm run validate)
---

# cv-pr

This skill's only job is to **open a pull request** for review. It does not merge and does not deploy: when a reviewer approves and the pull request is merged into `main`, `.github/workflows/pages.yml` tests the content and updates the GitHub Pages site by itself.

## Style

- Talk like a helpful person: "your changes", "reviewers", "your website". Run git and npm commands yourself and show a command only when the user asks or something fails.
- Every decision is an AskUserQuestion with 2 to 4 short options, the best one first and labelled "(Recommended)". One question at a time; never ask choices as plain text.
- Before anything that leaves this computer, say in one plain sentence what will happen, then ask.
- Progress is a short checklist, one fact per line, under about 80 characters. Errors: one or two plain lines, then options.

## Steps

1. **Checks.** Quietly run `npm test` and `npm run validate`. Passing: `✔ Your CV passed all checks`. Failing: explain simply and offer "Fix it now (use the `cv-validate` steps)" or "Stop".
2. **Settings.** Quietly read `src/config/site.json` and `git remote -v`. If `owner.github` does not match the account in the remote, or `baseUrl` is not the site address (`https://<owner>.github.io/<repo>/`, or `https://<owner>.github.io/` for a repo named `<owner>.github.io`), say so plainly and ask which value to correct.
3. **Your changes.** Run `git status` and `git branch --show-current`, then show: `✔ Branch: <name>`, `✔ <n> change(s) ready`, `✔ <n> files changed`. Uncommitted edits: ask "Save them with a short description (Recommended)", "Let me look first", or "Stop".
4. **Not on a branch.** If the current branch is `main`, explain that a pull request needs a branch, and ask "Create a branch for my changes (Recommended)" or "Stop". Never push straight to `main`.
5. **Upload.** Say: "This uploads your changes to GitHub. The repository is public, and nothing goes live yet." Ask "Upload them (Recommended)" or "Stop", then push the branch.
6. **Open the pull request.** Write a short, plain title and description (what changed, that the checks passed), then:
   - If `gh` works (`gh auth status`): ask "Create the pull request for me (Recommended)" or "Just give me the text", then run `gh pr create --base main`.
   - If `gh` is not installed (do not install it): ask "Open the GitHub page and copy the description for me (Recommended)" (macOS: `open <link>` and `pbcopy`) or "Just show me the text". The page is `https://github.com/<owner>/<repo>/compare/main...<branch>?expand=1`. Tell the user: paste the description and click the green **Create pull request** button.
7. **Reviewers.** Tell the user, in plain words, that on the pull request page they can add people under **Reviewers** (right side), and that once someone approves they click **Merge pull request**. Do not merge for them.
8. **What happens next.** End with `✔ Pull request ready for review` and two lines: "After it is merged into main, your website updates by itself in about a minute." and the address `https://<owner>.github.io/<repo>/`.
9. **One-time Pages setup** (ask only once per conversation): "Has GitHub Pages been turned on for this repository?" Options: "Yes, it is on", "Show me how (Recommended)", "Not now". If asked, give the plain steps: open the repository on GitHub, **Settings**, **Pages** in the left menu, under **Source** choose **GitHub Actions**. Without this, the first merge will not publish the site.
