# 10xdevs Course Project

A project prepared for the [10xdevs](https://www.10xdevs.pl/) course focused on learning AI agent workflows in software development.

## About the Project

**10xgames** is a retro game platform without ads, trackers, or accounts. Just open it and play whenever you want to kill some time.

👉 https://mrozowski.github.io/10xdev3.0/

All games were created with the help of an agentic AI workflow, following the ideas and practices introduced during the 10xdevs course.

The main goal of this project was not just to build the games, but to focus on the course itself: learning how to interact with AI agents, how to use them properly in software development, and understanding their strengths and weaknesses.

For more details please check the project folder: 📁 [/10xgames](https://github.com/mrozowski/10xdev3.0/tree/master/10xgames)

## What Did 10xdevs Teach Me?

* Simply asking an agent to write a project, prepare tests, create a deployment, or write a configuration is not good enough. Agents give much better results when we provide them with better context.
* Keeping documentation for the agent in Markdown files inside the project helps the agent work faster and generate code that follows our style and guidelines.
* With well-prepared context and documentation, an agent can write not only small methods, but entire features, test them, review the results, and improve them.
* We can use agents for much more than coding. Most importantly, they can help validate a project idea, ask important questions about the project, brainstorm, define the technology stack, and prepare deployment and testing strategies before we (or the agent) even start writing code.
* We can run more than one agent at the same time, with each agent working on something different: researching a topic, implementing a feature, preparing E2E tests, etc. This can be very powerful, but we still need to be present to provide the details the agents need and to test and review the results.

## Where Was I Surprised?

* The agent suggested creating the assets instead of making me hunt for images and sounds online. It was able to generate surprisingly good synthetic sound effects and SVG elements for the pages and games.
* Running two agents in different Git worktrees while they implement two different features is quite cool. You just need to stay focused, because both agents will often need something from you at the same time.

## Issues I Found With a Fully Agentic Workflow

* **Agents cannot make good decisions on their own.** We know what we want, while an agent can only make general assumptions. That's why it is important to prepare well-defined context and documentation and always check what the agent is doing.
* **Tokens cost money.** More powerful models also tend to consume tokens faster. This raises the question of whether some tasks are better done by myself when I already know exactly what needs to be done.
* **Some tasks take longer with an agent.** I feel that some small things an agent does take more time than if I just did them myself. For example, simple Git commands like `git add`, `git commit`, or `git push`.
* **The tooling is still immature.** Agents, LLMs, and the tools around them are still relatively new and rapidly evolving technologies. This makes it difficult for the ecosystem to establish good standards, tools, and approaches. Most companies and developers are still experimenting with agents and trying to find the best ways to work with them. I still feel that we are missing proper, well-integrated, and mature tools that provide a more clearly defined and reliable framework for agentic development.


I cannot wait for a mini PC that could run a local LLM so I could use it in my daily work without worrying about token costs and privacy. There are already some options available like AMD Strix Halo Mini PC, but they can be still quite expensive. Since this technology is developing so quickly, I'm hoping that as more brands enter the market, they will become more capable and prices will eventually come down in a few years
