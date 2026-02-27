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
- email notifikácie pri vytvorení tréningu pre hráčov vo vybranej kategórii (ak je nastavené SMTP)


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

### Sportsnet Online (automatické dáta)

- `GET /api/sportsnet/matches`
- `GET /api/sportsnet/matches?refresh=true` (ignoruje cache)

Backend endpoint je pripravený ako adaptér na `sportsnet.online` feed/API.
Potrebné env premenné:

- `SPORTSNET_API_URL` (URL feedu/endpointu od Sportsnetu)
- `SPORTSNET_API_KEY` (ak API vyžaduje Bearer token)
- `SPORTSNET_TEAM_ID` (voliteľné)
- `SPORTSNET_COMPETITION_ID` (voliteľné)
- `SPORTSNET_SEASON` (voliteľné)
- `SPORTSNET_CACHE_SECONDS` (voliteľné, default `300`)

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
5. voliteľne pre email notifikácie tréningov nastav:

- `EMAIL_NOTIFICATIONS_ENABLED=true`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`
- `SMTP_USER`, `SMTP_PASS`
- `SMTP_FROM_EMAIL` (odosielateľ)

6. Prisma:
   - `npx prisma generate`
   - `npx prisma db push`
7. spusti server: `npm run dev`

### Email notifikácie tréningov

- po vytvorení tréningu sa odošle email aktívnym hráčom danej kategórie, ktorí majú vyplnený email
- mapovanie kategórií:
  - `pripravky` -> `pripravka_u9`, `pripravka_u11`
  - `ziaci` -> `ziaci`
  - `dorastenci` -> `dorastenci`
  - `adults_young` -> `adults_young`
  - `adults_pro` -> `adults_pro`
- email používateľa zadáš pri vytvorení účtu v správe účtov

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

## 10) Deploy: Render + Vercel (Neon už máš)

Táto verzia repozitára je pripravená na:

- **Backend na Render** cez `render.yaml`
- **Frontend na Vercel** cez `vercel.json` rewrite `/api/* -> Render backend`

### Kroky

1. **Render (backend)**

- v Render vyber **Blueprint deploy** z tohto repozitára (použije `render.yaml`)
- nastav secrety:
  - `DATABASE_URL` = Neon connection string
  - `JWT_ACCESS_SECRET` = dlhý náhodný secret
- po deploy si skontroluj health: `https://<render-service>.onrender.com/api/health`

2. **Vercel (frontend)**

- importni ten istý repozitár do Vercel (root projekt)
- po prvom deploy uprav v `vercel.json` hodnotu `destination` na reálnu Render URL, ak sa líši od:
  - `https://osk-kamenna-poruba-backend.onrender.com`
- redeployni frontend

3. **CORS + cookie doména**

- v Render env nastav `FRONTEND_ORIGIN` na tvoju Vercel doménu (napr. `https://your-app.vercel.app`)
- pre produkciu nechaj `COOKIE_SECURE=true`

### Poznámka

Frontend už používa:

- lokálne: `http://localhost:4000/api`
- produkčne: `/api` (proxy cez Vercel rewrite)

Takto zostane login/cookie flow funkčný bez hardcoded produkčného backend hostu v HTML.
