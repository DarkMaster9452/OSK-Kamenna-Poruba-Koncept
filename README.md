# OŠK Kamenná Poruba — Klubový web (Frontend + Backend + Neon)

Tento projekt je web futbalového klubu OŠK Kamenná Poruba s oddeleným frontendom a backend API.
Citlivé dáta (účty, roly, oznamy, ankety, tréningy a účasť) sú spravované cez backend a uložené v Neon PostgreSQL.

## 1) Čo projekt rieši

- verejnú prezentáciu klubu (domov, o nás, zápasy, galéria, kontakt)
- internú časť po prihlásení podľa roly používateľa
- správu tréningov, udalostí (oznamov) a ankiet
- evidenciu účasti hráčov na tréningoch

## 2) Role používateľov

- **Coach (tréner)**
  - vytvára a spravuje tréningy
  - vytvára udalosti/oznamy
  - vytvára a ukončuje ankety
- **Player (hráč)**
  - vidí relevantné tréningy/oznamy/ankety
  - hlasuje v anketách
  - potvrdzuje účasť na tréningu
- **Parent (rodič)**
  - vidí tréningy a stav detí
  - môže potvrdiť účasť za svoje dieťa

## 3) Hlavné funkcionality

- autentifikácia cez backend (`httpOnly` cookie session)
- CSRF ochrana pre write operácie
- role-based prístup (RBAC)
- tréningy: create/list/attendance/close/delete
- udalosti: create/list/delete (s cieľovou skupinou)
- ankety: create/list/vote/close/delete
- audit záznamy vybraných akcií v backende

## 4) Architektúra

- **Frontend**: statické HTML + JS súbory v koreňovom priečinku
- **Backend**: Node.js/Express v priečinku `backend/`
- **Databáza**: Neon PostgreSQL + Prisma ORM
- **Auth**: JWT session v `httpOnly` cookie + endpoint `me`

## 5) Štruktúra projektu

### Frontend (root)

- `index.html` — hlavná stránka + login + sekcie klubu
- `important_info.html` — udalosti a ankety
- `trainings.html` + `trainings.js` — tréningový modul
- `matches.html` — zápasy
- `players_list_coach.html` — zoznam hráčov pre trénera
- `player_detail_coach.html` — detail hráča pre trénera
- `images/` — obrázky a galéria

### Backend (`backend/`)

- `src/app.js` — inicializácia Express app
- `src/server.js` — štart servera
- `src/routes/` — API routy (`auth`, `trainings`, `announcements`, `polls`, ...)
- `src/middleware/` — auth, role guard, CSRF, error handling
- `prisma/schema.prisma` — dátový model
- `.env.example` — vzor konfigurácie

## 6) API prehľad

### Základ

- `GET /api/health`
- `GET /api/csrf-token`

### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/change-password`

### Tréningy

- `GET /api/trainings`
- `POST /api/trainings` (coach)
- `PATCH /api/trainings/:id/attendance` (player/parent)
- `PATCH /api/trainings/:id/close` (coach)
- `DELETE /api/trainings/:id` (coach)

### Udalosti a ankety

- `GET /api/announcements`, `POST /api/announcements`, `DELETE /api/announcements/:id`
- `GET /api/polls`, `POST /api/polls`, `POST /api/polls/:id/vote`, `PATCH /api/polls/:id/close`, `DELETE /api/polls/:id`

## 7) Lokálne spustenie

### Požiadavky

- Node.js 18+
- npm
- Neon PostgreSQL databáza

### Backend

1. Prejdi do `backend/`
2. `npm install`
3. skopíruj `.env.example` na `.env`
4. doplň minimálne:
   - `DATABASE_URL`
   - `JWT_ACCESS_SECRET`
   - `FRONTEND_ORIGIN`
5. Prisma:
   - `npx prisma generate`
   - `npx prisma db push`
6. spusti server: `npm run dev`

### Frontend

- otvor root projekt cez Live Server (alebo iný statický server)
- frontend komunikuje s backendom na porte podľa `.env` (štandardne `4000`)

## 8) Bezpečnostné poznámky

- do repozitára nepatria reálne heslá ani osobné účty
- `.env` je lokálny a nemá sa commitovať
- citlivé dáta patria do databázy (Neon), nie do frontend súborov

## 9) Aktuálny stav

- projekt je funkčný MVP s backend autentifikáciou a Neon perzistenciou
- verejné časti webu fungujú ako prezentačný web klubu
- interné moduly (tréningy, udalosti, ankety) sú riešené cez API
