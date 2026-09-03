# 10xdevs Course Project

A project prepared for the [10xdevs](https://www.10xdevs.pl/) course focused on learning AI agent workflows in software development.

## About the Project

**10xgames** is a retro game platform with **no ads, trackers, or accounts**. Just open it and play whenever you want to kill some time.

 👉 **Play 10xgames** :)  https://mrozowski.github.io/10xdev3.0/

The platform is deployed on GitHub Pages and the entire project was created with the help of an agentic AI workflow, following the ideas and practices introduced during the 10xdevs course.

**The goal of this project was not just to build a game platform.**

The main focus was to learn how to:

- work effectively with AI agents,
- use agents in a software development workflow,
- understand where agents work well,
- identify their limitations and weaknesses.

The project folder: 📁 <a href="https://github.com/mrozowski/10xdev3.0/tree/master/10xgames" target="_blank" rel="noopener noreferrer">/10xgames</a>  

Project technological details can be found in: 🗒️ <a href="https://github.com/mrozowski/10xdev3.0/blob/master/10xgames/README.md" target="_blank" rel="noopener noreferrer">/10xgames/README.md</a>  

## What Did 10xdevs Teach Me?

* **We can use agents for much more than coding**. Most importantly, they can **help**: validate a project idea, ask important questions about the project, brainstorm, define the technology stack, prepare deployment and testing strategies before we (or the agent) even start writing code.
* With **well-prepared context and documentation**, an agent can write not only small methods, but entire features, test them, review the results, and improve them.
* **Keeping documentation for the agent in Markdown files** inside the project helps the agent work faster and generate code that follows our style and guidelines.
* **We can run more than one agent at the same time**, with each agent working on something different: researching a topic, implementing a feature, preparing E2E tests, etc. This can be very powerful, but we still need to be present to provide the details the agents need and to review the results.
* **A Well done agentic workflows allow to ship MVPs fast**, but without proper reviews, guardrails, automated testing, and understanding of the functionalities, things can easily diverge or break.

## Where Was I Surprised?

* Running two agents in different Git worktrees while they implement two different features is quite cool. You just need to stay focused, because both agents will often need something from you at the same time.
* The agent suggested creating the assets instead of making me hunt for images and sounds online. It was able to generate some generic but good synthetic sound effects and SVG elements for the pages and games.
* FruitRush Game took less than a day to prepare MVP version.

## Issues I Found With a Fully Agentic Workflow

* **Agents cannot make good decisions on their own.** We know what we want, while an agent can only make general assumptions. That's why it is important to prepare well-defined context and documentation and always check what the agent is doing.
* **Tokens, tokens, tokens.** In an agentic workflow where almost all tasks are handled by agents, the amount of tokens used can go up very fast, especially if we use more powerful models.
* **Some tasks take longer with an agent.** I feel that some small things an agent does take more time than if I just did them myself. For example, simple Git commands like `git add`, `git commit`, or `git push`.
* **The tooling is still immature.** Agents, LLMs, and the tools around them are still relatively new and rapidly evolving technologies. This makes it difficult for the ecosystem to establish good standards, tools, and approaches. Most companies and developers are still experimenting with agents and trying to find the best ways to work with them. I still feel that we are missing proper, well-integrated, and mature tools that provide a more clearly defined and reliable framework for agentic development.
* **Results feel generic** Somehow, a game that is fully done by an agent feels a bit generic, even if the agent added some retro styling as requested. _(Maybe this could be improved with more detailed styling documents)_
* **Mistakes** Despite all the documentation, the agent still made some mistakes or overlooked/forgot to add things that would be obvious to a developer. Maybe if we explain in more detail what needs to be done, that would work better. However, I cannot really complain, because it was still able to make a game (MVP) quite quickly — probably faster than I would. But it's MVP not a fully polished and tweaked game. Getting it to that level would require more human input, since the agent cannot really "see" or "play" the game the same way a human does.
* **Patience** When working with an agentic workflow, we need to be patient. Once the prompt is ready, we just look at the agent thinking and working. But we cannot get distracted by doing other nice stuff like watching YouTube or playing games while the poor agent is doing all the work, because sometimes the agent needs our attention and will not do anything until we respond. It would be nice if it could jump between tasks when it is blocked. 

