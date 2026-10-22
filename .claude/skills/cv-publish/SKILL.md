---
name: cv-publish
description: Publish this CV site on GitHub Pages - run the checks, open a pull request (or push to main), set the Pages source and watch the deployment until the site is live.
when_to_use: The user explicitly asks to deploy, publish, put the CV online, or open a pull request for their changes.
disable-model-invocation: true
allowed-tools: Bash(git status *) Bash(git branch *) Bash(git remote -v) Bash(git log *) Bash(git diff *) Bash(npm test) Bash(npm run validate)
---

# cv-publish

The deployment is `.github/workflows/pages.yml`: on every push to `main` it runs the tests and validation, then publishes `src/`. So a change goes live when it reaches `main`. Pushing, opening a pull request, merging and changing repo settings affect the outside world, so **ask before each of those steps** and say exactly what will happen.

1. Run the `cv-validate` steps. Do not continue on errors.
2. Check `src/config/site.json`: `owner.github` is the user's account and `baseUrl` will match the final URL (`https://<owner>.github.io/<repo>/`, or `https://<owner>.github.io/` for a repo named `<owner>.github.io`).
3. Check `git status`, the current branch and `git remote -v`. Uncommitted changes: show them and offer to commit (conventional, short message).
4. **On a branch other than `main`: open a pull request** into `main`.
   - Ask, then `git push -u origin <branch>`.
   - Summarise `git log main..HEAD --oneline` and `git diff main --stat` into a short title and body (what changed and why, how it was checked: tests and validate passed).
   - If `gh` is installed and authenticated (`gh auth status`): ask, then `gh pr create --base main --head <branch> --title "..." --body "..."`, and show the PR URL.
   - If `gh` is missing: do not install it. Give the user the compare link `https://github.com/<owner>/<repo>/compare/main...<branch>?expand=1`, the proposed title and body to paste, and the click path (Open pull request → Create pull request).
   - Tell the user the Pages workflow does not run on the PR; it runs when the PR is merged into `main`. Merging is the user's decision: offer to merge only if they ask.
5. **On `main`:** explain that pushing deploys immediately, then ask before `git push`.
6. Pages source (once per repo): Settings → Pages → Build and deployment → Source = **GitHub Actions**. With `gh`, offer to check it (`gh api repos/<owner>/<repo>/pages`); otherwise give the click path.
7. After the merge or push: watch the run (`gh run watch`, or the Actions tab link) and report failures with the failing step.
8. When it is green, give the live URL and open it for the user. Remind them that later edits deploy the same way.
