# Spendavi

Spendavi is a financial decision app built around one core action:

> Ask before you spend.

The app helps a user understand what is safe to spend before money leaves their account. It protects bills, debt minimums, essential spending and a personal buffer, then gives a simple Green, Amber or Red decision.

## Product pillars

- Safe-to-spend dashboard
- Spend Check before purchase
- Bills and direct debits
- Debts, APR and monthly interest
- Spendavi Scan for real-world shopping decisions
- Mobile-first experience for iPhone, Android and tablets

## Repository structure

```text
apps/
  web/       Spendavi.com landing page and web preview
  mobile/    Expo React Native mobile app
supabase/
  schema.sql Database schema for future account-based version
```

## Current build stage

This repository is at MVP foundation stage. The first priority is to run the web landing page, then the mobile app locally with Expo.

## Local setup

Install Node.js, then from the repository root:

```bash
npm install
```

Run the web app:

```bash
npm run dev:web
```

Run the mobile app:

```bash
npm run dev:mobile
```

## Security note

Do not commit private keys, Supabase service role keys, banking credentials or payment secrets to this repository.
