---
project: "10x Games"
context_type: greenfield
created: 2026-08-31
updated: 2026-08-31
product_type: web-app
target_scale:
  users: medium
timeline_budget:
  mvp_weeks: 3
  hard_deadline: 2026-09-14
  after_hours_only: true
checkpoint:
  current_phase: 8
  phases_completed: [1, 2, 3, 4, 5, 6, 7]
  gray_areas_resolved:
    - topic: "primary pain"
      decision: "Workflow friction from ads, installation, and account creation."
    - topic: "status quo insight"
      decision: "Existing options optimize for monetization instead of instant, private play."
    - topic: "primary persona scope"
      decision: "People passing time while waiting."
    - topic: "access model"
      decision: "No login; local player names label shared, device-local high scores."
  frs_drafted: 7
  quality_check_status: accepted
---

## Seed Idea

## 10x Games - MVP

### Główny problem

Brakuje prostego, estetycznego miejsca z klasycznymi grami przeglądarkowymi, które można uruchomić od razu bez instalowania aplikacji.

### Najmniejszy zestaw funkcjonalności

* Statyczna strona działająca na GitHub Pages
* Strona główna z nazwą „10x Games” i kafelkami dostępnych gier
* Retro stylistyka, dopracowane UI/UX, animacje i efekty dźwiękowe
* Responsywny interfejs działający na komputerze i urządzeniach mobilnych
* Jedna kompletna gra MVP: Memory Cards
* Memory Cards z kilkoma rundami o rosnącym poziomie trudności
* Możliwość wyboru tematyki kart, np. zwierzęta, rośliny lub technologie/programowanie
* Łatwy mechanizm dodawania assetów (obrazy, dźwięki) bez konieczności modyfikowania kodu gry

### Co NIE wchodzi w zakres MVP

* Tworzenie kont i zapisywanie wyników użytkowników
* Backend i baza danych
* Własny system rankingów
* Wiele gier — kolejne gry, np. Tetris lub Snake, mogą zostać dodane później
* Tworzenie własnych grafik i dźwięków — assety mogą być dostarczone jako pliki dodawane do projektu

### Kryteria sukcesu

* Memory Cards jest kompletną, grywalną i responsywną grą z dopracowanymi animacjami, dźwiękami i UI
* Strona i gra mają spójny, atrakcyjny styl retro
* Dodanie kolejnej gry nie wymaga przebudowy istniejącej aplikacji

## Vision & Problem Statement

People passing time while waiting face installation, advertising, and account-creation barriers when they want to play a classic game briefly. The current alternatives can prevent them from starting a game at all.

Existing options optimize for monetization instead of instant, private play.

## User & Persona

The primary persona is an adult familiar with classic games such as Memory Cards or Tetris who is waiting for an appointment, travelling, or bored at home. They reach for 10x Games when they have a short break and want to click Play without installing an app or creating an account.

## Access Control

No login is required. Players may enter a local name to label their high scores on a shared device; all players can view the device's locally stored scores. There are no roles or access restrictions.

## Success Criteria

### Primary

- Within three weeks, a player can immediately choose and configure Memory Cards, complete a round, view a score, optionally use a frictionless local name, and replay or return to the game list.

### Secondary

- Memory Cards offers additional themes beyond the software-development theme.

### Guardrails

- The site and game work well on PC, laptops, tablets, and phones.

## User Stories

### US-01: Player starts a Memory Cards game

- **Given** a player opens the page
- **When** they select Memory Cards
- **Then** the Memory Cards game loads and the player can start a new game

#### Acceptance Criteria

- A player can choose a theme and turn sound on or off before starting.
- A player can complete a round and see their score.

### US-02: Player saves a completed-round score

- **Given** a player has won or lost a round
- **When** they enter or accept a generated name
- **Then** their new score is saved locally under that name

## Functional Requirements

### Game access and play

- FR-001: Player can access the game site online. Priority: must-have
  > Socrates: Counter-argument considered: online access could add release work or exclude weak-connectivity players. Resolution: kept; public online access is required for the instant-play promise.
- FR-002: Player can select Memory Cards from the available games. Priority: must-have
  > Socrates: Counter-argument considered: a single-game MVP could make selection an unnecessary click. Resolution: kept; the selection page establishes the platform and enables later additions.
- FR-003: Player can optionally choose a card theme and turn sound on or off, or start a Memory Cards round immediately with defaults. Priority: must-have
  > Socrates: Counter-argument considered: setup controls could delay a short play session. Resolution: kept; settings are optional and the player can start immediately with defaults.
- FR-004: Player can start, play, complete, and see the score for a Memory Cards round. Priority: must-have
  > Socrates: Counter-argument considered: scoring might add complexity or unwanted competition. Resolution: kept; completing a playable round and seeing its result is the core product outcome.
- FR-005: Player can play Memory Cards without issues on a PC, tablet, or phone. Priority: must-have
  > Socrates: Counter-argument considered: broad device support could jeopardize the MVP timeline. Resolution: kept; consistent play across common devices is a stated guardrail.

### Presentation and local scores

- FR-006: Player experiences a clean retro interface with effects, textures, or images. Priority: must-have
  > Socrates: Counter-argument considered: visual polish could distract, reduce device responsiveness, or consume core-game time. Resolution: kept; the clean retro presentation is central to the experience.
- FR-007: Player's completed-round score is saved locally under a generated name unless they optionally enter a name; naming never blocks replay or leaving. Priority: nice-to-have
  > Socrates: Counter-argument considered: naming and persistence could create post-game friction or exceed the core-play scope. Resolution: kept as nice-to-have; scores save automatically under a generated name and optional naming must be frictionless.

## Forward: tech-stack

- The site should be available online, with GitHub Pages offered as an example hosting option.

## Non-Functional Requirements

- The product displays no advertisements and collects no player data.
- The product supports play on phones, tablets, PCs, and laptops.
- A player experiences the initial page load within 2 seconds on a normal connection.
- Locally saved scores remain available until the player clears the device's local storage.

## Business Logic

The selected theme determines the images shown on Memory Cards, such as animals, plants, or software-development logos and tools.

The first round briefly reveals all card images before turning them face down. The player selects pairs; each successful pair earns points, and the round ends when all pairs are found within its time limit.

Later rounds become more difficult by omitting the initial card reveal and increasing the number of pairs, for example from 16 to 20 or 30.

## Non-Goals

- Additional games are post-MVP so the first release can focus on one complete Memory Cards experience.
- Accounts and cloud score syncing are excluded to preserve immediate, private play.
- A backend and database are excluded from the MVP.
- A custom ranking system is excluded from the MVP.
- Creating custom graphics and sound assets is excluded; assets may be supplied as project files.

## Quality cross-check

- Access Control: present.
- Business Logic: present as a one-sentence declarative rule.
- Project artifacts: present with a valid checkpoint.
- Timeline-cost acknowledgment: present; the MVP is estimated at three weeks.
- Non-Goals: present.
