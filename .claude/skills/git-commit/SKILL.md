---
name: git-commit
description: Analyze the current Git changes, commit one logically related group with a Conventional Commit message, and report the commit details.
---

# Git Commit

Create exactly one local Git commit for one logically related group of current changes. Do not push.

## Procedure

1. Inspect the repository and working tree before changing anything:
   - Run `git status --short` and `git diff --stat`.
   - Inspect `git diff` and `git diff --cached`; for untracked files, inspect their contents before deciding whether they belong in the commit.
   - Identify the changes' intent and group files by logical purpose. Do not infer a file's purpose from its name alone.
2. Choose one coherent group of files for this commit. If the working tree contains multiple independent groups, choose the most clearly related group and leave all other changes untouched. Do not include ignored files, build output, secrets, or unrelated user changes.
3. Check staging carefully. Never accidentally include unrelated staged changes. If the selected group intersects a file with both staged and unstaged edits, preserve the existing index/worktree state; do not reset, restore, or discard either version. If the intended commit cannot be isolated without altering other work, stop and explain the blocker rather than risking data loss.
4. Form a concise Conventional Commit subject using `<type>(<optional-scope>): <description>`. Choose an accurate type such as `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `chore`, `perf`, or `style`. Use imperative, specific wording; add a body only when needed to clarify the change.
5. Stage only the chosen files, then verify the staged diff and staged file list before committing. If the selected changes cannot be staged without including unrelated changes, stop and report why.
6. Create exactly one commit with the chosen message. Do not amend an existing commit or bypass hooks. Do not use `--amend` or `--no-verify`. Never run `git push` or otherwise publish the commit.
7. After a successful commit, obtain the commit hash, subject, and committed file list from Git (for example, `git log -1 --format=%H%n%s` and `git diff-tree --no-commit-id --name-only -r HEAD`). Report these three items clearly. If the commit fails, do not claim success; report the failure and leave the remaining changes intact.

## Guardrails

- Make one commit only; do not split the chosen group into multiple commits or create a follow-up commit.
- Do not silently discard, stash, reset, or rewrite user changes.
- Keep all non-selected changes in their original state.
- A clean working tree is not required; only the selected, verified group belongs in this commit.
 