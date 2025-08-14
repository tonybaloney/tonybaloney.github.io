blog_heading: Using an LLM in GitHub Actions
blog_subheading: Using the LLM CLI in a GitHub Action workflow with GitHub Models
blog_header_image: posts-original/gpt-5-nano.jpg
blog_author: Anthony Shaw
blog_publish_date: August 14, 2025
---------------------------------

LLMs are effective for generating both code and written text. They're also quite effective for reviewing text, finding mistakes and many other things.

As an open-source maintainer I'm always looking for opportunities to automate my workflow so that I can ship better tools. I've been exploring a few AI-based tools to help me review community PRs as a first-pass so that I can focus less on the obvious things (spelling mistakes, lack of tests) and focus on overall quality. 

One thing I struggle to keep on top of is documentation and tests. Bug fixes and features from folks in the community rarely include documentation updates and additional tests. I'm continually falling behind on updating the docs or maintaining test coverage.

So, could AI help me? 

## GPT-5 in GitHub Models

GPT-5 was just released last week, along with a series of models in different sizes (mini, nano, chat). 

You can access GPT-5 from [openai.com](https://openai.com) or from [Microsoft Azure](https://azure.microsoft.com/free). As a GitHub user you also get access to GPT-5 through [GitHub Models](https://github.com/marketplace?type=models). GitHub Models is a service for GitHub users to access over 30 AI models. GitHub users can access these models via the GitHub Models API (using a GitHub API key) or via the GitHub Models integration in the Marketplace.

The folks at GitHub are working on something they call [**Continuous AI**](https://githubnext.com/projects/continuous-ai/) where AI is used for automation. 
If you think about your existing GitHub workflows, they need to be:

1. Reliable and deterministic (something is either pass or fail)
1. Fast
1. Cheap

Even as an "AI-friendly" I'll be honest. LLMs don't get a big tick for any of those boxes. 

The closest we are to **cheap** and **fast** is the OpenAI mini and nano models. I was already a big fan of the **GPT-4.1-mini** model for translations, small text processing and code snippets. For RAG, I've been defaulting to 4.1-mini for some time. OpenAI's mini models are relatively cheap and fast. Nano models are 25x cheaper than full GPT-5.

__OpenAI.com List Pricing__:

| Variant | Input $ /1M Tokens | Output $ /1M Tokens | Relative Cost |
| ------- | ------------------ | ------------------- | ------------- |
| GPT-5   | $1.250 | $10.00 | (1x) | 
| GPT-5-mini | $0.250 | $2.00 | 5x cheaper | 
| GPT-5-nano | $0.050 | $0.4 | 25x cheaper |

In GitHub Models you get a generous free quota for both mini and nano models. For GPT-5 you get enough free quota to try it out, beyond that you need to look at the [GitHub Models pricing](https://docs.github.com/en/billing/concepts/product-billing/github-models).

## Non-deterministic Automation? 

If you scroll right to the bottom of that [**Continuous AI**](https://githubnext.com/projects/continuous-ai/) post on GitHub it says how you can try this today by linking to a little project I've been working on. It's a plugin to [Simon Willison's LLM CLI](https://llm.datasette.io/) for GitHub Models.

Using this plugin, `llm` will communicate with the GitHub Models API using your API key. From there you can do prompt completions, tool calling and image generation from your shell:

```bash
pip install llm-github-models
llm keys set github
# paste your key
```

Once you have it configured, you can use any of the [supported models](https://github.com/tonybaloney/llm-github-models?tab=readme-ov-file#supported-models) to do anything that LLM offers like basic completions:

```bash
$ llm prompt 'top facts about cheese' -m github/gpt-4.1-mini
Sure! Here are some top facts about cheese:

1. **Ancient Origins**: Cheese is one of the oldest man-made foods, with evidence of cheese-making dating back over 7,000 years.

2. **Variety**: There are over 1,800 distinct types of cheese worldwide, varying by texture, flavor, milk source, and production methods.
```

All the way up to inline tool definition and invocation:

```bash
$ llm -m github/gpt-4o --functions 'def multiply(x: int, y: int) -> int:
    """Multiply two numbers."""
    return x * y
' 'what is 34234 * 213345' --td

Tool call: multiply({'x': 34234, 'y': 213345})
  7303652730

34234 multiplied by 213345 equals 7,303,652,730.
```

You can also use it directly from [GitHub Codespaces](https://simonwillison.net/2025/Aug/13/codespaces-llm/).

The main reason I like the LLM CLI is because it's on my shell I can easily pipe data from other sources into the LLM:

```bash
$ cat .\.gitignore | llm prompt -m github/gpt-5-mini "Based on this gitignore, tell me what the main coding language is in this project. Respond only with the language name"
C#
```

So I've been experimenting with this capability to do some Continuous AI. I've got 3 experiments to share:

1. [Suggesting updates to the docs based on the PR](#experiment-1-do-the-docs-need-updating)
1. [Reviewing documentation changes for errors](#experiment-2-are-there-mistakes-in-the-docs)
1. [Reviewing language translations](#experiment-3-are-the-translations-correct)

I'm searching for some automations which will save me time and improve quality. Going back to the 3 things in **Reliable**, **Fast**, and **Cheap** rules for Automation I'm going to try and write these automations in a way that is non-deterministic and using GPT-5-mini or nano.

## Experiment 1: Do the docs need updating?

For this first experiment, I want to detect documentation regressions. That's when the code has changed in a way which might also need the docs to be updated. This is something I genuinely struggle with, I'll be reading documentation (including my own) and noticing something is out of date. 
Putting "add documentation" in the PR template isn't particularly helpful.

If the LLM can see what has changed in the PR, can it determine whether the docs need to be updated. Even better, it could suggest what needs updating.

For this test, I don't want to pass the entire documentation to the LLM every time, so I'll generate a summary of what's in the docs today with this prompt in GitHub Copilot:

```default
Summarize all of the docs/ pages, their content and purpose in a bullet point list, e.g.

- `docs/getting-started.md` - explains how to start and configure the VS Code Pets extension—opening the pet panel, changing pet appearance and position, and using basic interactions like throwing balls, adding/removing pets, and switching themes.
```

That gave me a bullet-point summary that I can use to generate a prompt. We could ask for a short paragraph summary for each page instead of a single point to improve the quality of the suggestions. For now, I'll just go with a single sentence.

Next we need the changed files in this branch. `git diff` is the tool for this. We need to make the output friendly to the LLM by removing colors and paging (`--no-pager` and `--no-color`), then pipe that output into GPT-5-mini along with some instructions to suggest changes.

Yesterday I was seeing if GPT-5 could implement multiple balls in [VS Code Pets](https://github.com/tonybaloney/vscode-pets)
 so I tested it on the [commit](https://github.com/tonybaloney/vscode-pets/commit/df705aec39bfa2f0ac5e6459636027d406179ec0):

```bash
$ git --no-pager diff -p --no-color HEAD^ | llm prompt -m github/gpt-5-mini "Review this git diff and suggest where the documentation might need to be updated. For each of the doc pages, specify the page name and the suggested updates in a short summary. Some pages might not need to be updated, so don't list them if the changes are not relevant. The doc pages are:
>> index.md - project overview and installation instructions, with links to the other docs and a quick 'Getting Started' pointer.
>> getting-started.md - shows how to open the pet panel, start a session, change pet appearance/size/position, and lists quick links to common interactions (throwing balls, adding/removing pets, themes).
>> pets.md - detailed user guide for interacting with pets: playing with pets, adding/removing pets, throwing a ball (including mouse-throw option), roll-call, and importing/exporting pet lists.
>> themes.md - describes background themes and how to change the panel background (theme usage and available theme assets).
>> contributing.md - contribution guidelines for the project (how to build, test, and submit changes or translations).
>> credits.md - acknowledgements and credits for artwork, assets, and contributors.
"
```

It gave me this suggestion:

```markdown
getting-started.md
- Add a short note to the “throwing balls” / interactions quick-links section describing the new "Maximum number of balls" setting: show the setting id (vscode-pets.maxBalls), default (10), allowed range (1–50) and where to change it (Settings UI or settings.json). Mention that this caps how many balls can be in play at once.

pets.md
- Update the detailed "throwing a ball" / "playing with pets" section to document the new max-balls behavior:
  - Explain that there is now a configurable limit on how many balls can exist simultaneously (setting: vscode-pets.maxBalls).
  - Clarify the default value (10), valid range (1–50), and that any additional throws beyond the limit will not create new balls until others expire / are removed.
  - Note that changing the setting takes effect immediately for an open pet panel (no reload required).

contributing.md
- Add a short note about adding new user-facing configuration and localization keys:
  - Remind contributors to add entries to package.json and the localization files (package.nls.json / package.nls.en.json) when introducing new settings or messages.
  - Mention that tests and UI code may need updating when the pet panel API changes (for example, the webview app signature gained an extra maxBalls parameter in tests), and point to the test-suite files that may need adjustment when modifying the panel/webview API.
```

The suggestions are generic since it doesn't know what's in the docs. We could expand the summaries to a paragraph per page to improve this. 

```default
Summarize all of the docs/ pages with a series of bullet points in each page describing the content and structure. We will use this information as a rough index to determine when docs need to be updated. Write the results into a new markdown file
```

Giving this second prompt to [GitHub Copilot using GPT-5-mini](https://github.blog/changelog/2025-08-13-gpt-5-mini-now-available-in-github-copilot-in-public-preview/) generates a summary after recursively scanning my documentation.
It generated a file, `docs/docs-index-summary.md`, so I ran the prompt again and this time using a nested shell to include the index file into the prompt:

```bash
git --no-pager diff -p --no-color HEAD^ | llm prompt -m github/gpt-5-mini "Review this git diff and suggest where the documentation might need to be updated. For each of the doc pages, specify the page name and the suggested updates in a short summary. Some pages might not need to be updated, so don't list them if the changes are not relevant.  $(cat docs/docs-index-summary.md)"
```

This time, we get an improved suggestion that talks about the subsections in the page and seems to have a better feel for what needs to be updated.

```markdown
Suggested doc updates

1) docs/index.md
- Add a short "What's new" / feature highlight mentioning the new configurable "maxBalls" setting so users notice the multi-ball limit feature.
- Update any screenshots/GIFs or callouts that demonstrate many balls in play if they reference the previous default behavior (10) or show an unlimited feel — note that the number of simultaneous balls is now configurable.

2) docs/getting-started.md
- Add the new setting entry (vscode-pets.maxBalls) to the settings overview:
  - Name: "Maximum number of balls allowed in play at once" (matches package.nls).
  - Default: 10; allowed range: 1–50.
  - Show how to change it via Settings UI and settings.json (example snippet).
- Mention that changing this setting takes effect at runtime (the panel receives the new value and updates immediately).
- If the guide includes a recommended default or tips for performance (e.g., lower values for slower machines), add those recommendations.

3) docs/pets.md
- In the "Throwing a ball" / "Multi-ball behavior" section, document the new maxBalls setting:
  - Explain that there is a configurable cap on simultaneous balls to avoid excessive on-screen objects.
  - Default 10, range 1–50; non-positive values are ignored.
  - Describe runtime behavior: when the setting is changed the extension posts a message to the webview and the currently open pet panel(s) will update their limit immediately.
- Add a brief note about how the webview enforces the limit (i.e., new balls will not spawn beyond the configured limit) and reference any relevant user-visible behavior (e.g., older balls persist until they time out or are caught).
- If there are examples or screenshots that show ball interactions, consider updating them or adding an example showing a higher/lower maxBalls setting.

4) docs/contributing.md
- Add a short note about updating localization when adding settings or user-facing strings:
  - Remember to add keys to package.nls.json and package.nls.en.json (as done for vscode-pets.maxBalls.description).
- If the contribution guide mentions tests or mocking extension APIs, add a note that adding configuration parameters may require updating tests/mocks (the test changes in suite/panel.test.ts show an extra constructor argument).    
- If there are developer docs describing the webview protocol, mention that new messages like "set-max-balls" should be documented when added.

Files that likely do not need changes
- docs/themes.md — not directly impacted.
- docs/credits.md — not impacted.
- docs/requirements.txt — not impacted.
```

Overall, I'm happy with this and it could be integrated into a GitHub Action that runs when PRs are submitted, or periodically. For large PRs, this would exaust token quotas quickly. In practice, you'd want to cap the input (`head -n 1000`) or tweak `git diff` to only show certain files and those which don't have huge changes.

## Experiment 2: Are there mistakes in the docs?

Next, I want to create something like a linter, but for documentation. There are plenty of spell checkers out there, some even with basic grammar checks. 
LLMs are very, **very** good at reviewing text in any language. 

For this experiment, I'll use the same `git diff` trick to get the changed files, but only look at diffs in the `docs` folder of my project. I've also set up a GitHub Actions workflow.

For this prompt, I'll ask it to format it's suggestions in a special syntax for GitHub called annotations. This syntax is used by linters to contribute comments in code on commits and pull requests. Since the `git diff` includes the line number and the file name:

```bash
git --no-pager diff -p --no-color origin/main...${{ github.sha }} docs | llm prompt -m github/gpt-5-mini \
          "For each of the added lines in this output from git diff (those starting +), review grammatical \
          or spelling mistakes and print out the fixes. Only report spelling, punctuation and grammatical errors. \
          Use the formatting for GitHub Actions, e.g. \
              ::warning file=app.py,line=10,col=5::Code formatting issues detected"
```

I can take that command and integrate it into a "CI for Docs" workflow.

The workflow has a few particulars:

- `models: read` permission, so that the `GITHUB_TOKEN` will have access to my GitHub Models
- `fetch-depth: 0` in the checkout action so that it has some Git history to compare against
- Path filters so I only check changes to the docs folder and don't trigger all the time

```yaml
name: Docs CI
permissions:
  contents: read
  models: read

on:
  push:
    branches: ["main"]
    paths:
      - "docs/**"
      - ".github/workflows/docs-ci.yml"
      - "mkdocs.yml"
  pull_request:
    branches: ["main"]
    paths:
      - "docs/**"
      - ".github/workflows/docs-ci.yml"
      - "mkdocs.yml"

jobs:
  validate-docs:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - name: Setup Python
        id: installpython
        uses: actions/setup-python@v5
        with:
          python-version: "3.13"
      - name: Install LLM with GitHub Models
        run: python -m pip install llm-github-models
      - name: Review docs changes
        run: | 
          git --no-pager diff -p --no-color origin/main...${{ github.sha }} docs | llm prompt -m github/gpt-5-mini \
          "For each of the added lines in this output from git diff (those starting +), review grammatical \
          or spelling mistakes and print out the fixes. Only report spelling, punctuation and grammatical errors. \
          Use the formatting for GitHub Actions, e.g. \
              ::warning file=app.py,line=10,col=5::Code formatting issues detected"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - name: Build HTML with mkdocs (strict)
        run: |
          python -m pip install -r docs/requirements.txt
          python -m mkdocs build -s
```

You might want to also consider setting a concurrency group so that if one job start and another is running on that branch, it'll cancel the previous one (like if someone pushes 10 commits at once):

```yaml
concurrency:
  group: docs-ci-${{ github.ref }}
  cancel-in-progress: true
```

To test it out, I took an in-progress PR to my documentation and introduced a few deliberate mistakes. One that a spell checker might miss is the use of `cash` instead of `cache`, because `cash` is a valid word — it's simply the wrong word in that context. I also added a misplaced comma to see if the system would catch a grammatical error.

When I pushed the changes, the GitHub Action ran and produced 4 suggestions as inline annotations:

![A screenshot of my GitHub workflow](/img/posts/github-annotations-mini.png)

Nice! You can see this annotations both in the Run screen (above) and in the code review screen.

### What about nano?

This seems like a task perfect for GPT-5's smallest model, `nano`. To compare, lets review what GPT-5-mini found:

- validate-docs: docs/getting-started/installation.md#L23
    Spelling: "overide" should be "override" and "seting" should be "setting".
- validate-docs: docs/getting-started/installation.md#L22
    Grammar: "your users application data folder" should be "your user's application data folder" or "the user's application data folder" (add the possessive apostrophe).
- validate-docs: docs/advanced/troubleshooting.md#L26
    Punctuation: remove the misplaced comma — "override, the default application data folder" should be "override the default application data folder".
- validate-docs: docs/advanced/troubleshooting.md#L26
    Spelling: "cash" should be "cache".

That's our baseline, so we can switch to nano by just updating the command in the YAML workflow. 

Nano gave me this output:

- validate-docs: docs/getting-started/installation.md#L23
    Spelling/grammar: "overide" should be "override"; "seting" should be "setting".
- validate-docs: docs/getting-started/installation.md#L22
    Spelling/grammar: "your users" should be "your user's".
- validate-docs: docs/advanced/troubleshooting.md#L45
    Spelling/grammar: "cash" should be "cache".

It caught all three of the spelling/grammatical errors, but it missed the misplaced comma. Also, the nano responses were a lot more concise (maybe even terse).

Another difference that's a bit harder to spot is nano reported the `cash` error as being line 45 but mini reported it as line 26. I'm not suprised at this. LLMs are bad at counting and it has to add to the line number in the diff. Although both the mini and nano models support up to 200,000 input tokens I'd expect mathematical errors like this to increase with a larger diff. 

To try and fix this issue, I added `-U0` to `git diff` so that it wouldn't provide any lines of context to the diff. This reduces the input token count and reduces the chance of misreporting line numbers. For nano, this fixed the line numbers but this time around it only reported one issue (cash vs cache). For mini it only reported two.

So, in conclusion nano is too small for this task. 

As a next step, I think it makes sense to separate the tasks of parsing the git diff and reviewing the content. The LLM should only review the content and something programmatic should report line numbers. 

## Experiment 3: Are the translations correct?

The next task is similar to documentation, but this time for translations. My extension, [VS Code Pets](https://github.com/tonybaloney/vscode-pets) has translations to over 25 languages. These are all maintained by folks from the community, who submit human translated changes via [Crowdin](https://crowdin.com/).

This system works really well, Crowdin submits PRs automatically with the community contributed translations and I merge them into the extension. After code-reviews.

Except I don't speak 27 languages. I speak 2 and a half.

I have no idea if **왕관 앵무** is actually Korean for Cockatiel, I'm just taking someone's word for it. Normally if there are mistakes, someone else submits a correction.

My big fear is that someone contributes something silly or offensive, I don't spot it and ship it to users. I don't know if **Gummianka** is a swear word in Swedish.

But AI does.


So, I adapted the docs workflow to look at changes to the `l10n` folder and parse those to gpt-5-mini to ask it for blatantly inaccurate or offensive terms. 

```yaml
    - name: Review l10n changes
        run: | 
          git --no-pager diff -p --no-color origin/main...${{ github.sha }} l10n | llm prompt -m github/gpt-5-mini \
          "For each of the changed lines in this output from git diff (those starting +), comment on whether the translation for that
          language is blatantly inaccurate or offensive. \
          Use the formatting for GitHub Actions, e.g. \
              ::warning file=app.py,line=10,col=5::Code formatting issues detected"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Conclusion

I think this has a lot of potential. `git diff` isn't an ideal mechanism for feeding content directly into an LLM — it mixes line-number metadata with text and makes accurate annotations harder. In practice it's better to separate parsing (to extract files and precise line numbers) from the LLM's content review. That approach gives more accurate annotations, reduces token usage, and is easier to debug.