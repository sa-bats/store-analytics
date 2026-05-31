# Store Analytics

TypeScript project with two tasks: a console report and an interactive web app.

## Authors

- Samuil Batšinski


## Task 1 — Console Report

Prints a formatted store analytics report to the console.

Covers: products, suppliers, warehouse stock, reviews, discount rules.

Calculates per product: available quantity, stock status (OUT / LOW / IN_STOCK), average rating, discounted price.

```
npm install
npm run task1
```

## Task 2 — Web App

Interactive web application built with vanilla TypeScript + Vite.

- Product list rendered dynamically as cards
- Add product via form with input validation
- Filter by name, sort by name / price / available / rating
- Data persisted in localStorage, restored on page reload
- Business logic shared with Task 1 via `src/core.ts`

```
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project structure

```
src/
  core.ts    — shared logic (types, calculations, seed data)
  task1.ts   — console report
  task2.ts   — web app (DOM, form, localStorage)
index.html   — app shell
```

## AI Usage

Claude (claude.ai) was used as an AI assistant during development.

**Initial prompt:**

> I have a TypeScript assignment. Need to build two things:
>
> 1. A console app that prints a store analytics report — products with stock status (OUT/LOW/IN_STOCK), average rating, discount price, specs
> 2. A web app (vanilla TS + Vite) that shows products as cards, has a form to add new ones, filter/sort, and saves to localStorage
>
> The logic should be shared between both tasks in a separate module. Can you help me structure the project and implement it step by step?

AI helped with project structure, implementation and debugging. All code was reviewed and understood before use.
