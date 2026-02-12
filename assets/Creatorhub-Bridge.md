# Evendi ↔ CreatorHub Bridge – Fullstendig dokumentasjon

> Sist oppdatert: 13. juni 2025

---

## 1. HVORFOR – Formål

### Kjernevirksomheten til Evendi
Evendi er en **multi-event planleggingsplattform** — ikke en bryllupsapp. Hele plattformen drives av én sentral konfigurasjonsfil: [`shared/event-types.ts`](../shared/event-types.ts).

**B2C – Personlige livshendelser (6 typer)**
| Type | Norsk | Ikon |
|---|---|---|
| `wedding` | Bryllup | 💒 |
| `confirmation` | Konfirmasjon | ⛪ |
| `birthday` | Bursdag | 🎂 |
| `anniversary` | Jubileum | 💍 |
| `engagement` | Forlovelse | 💎 |
| `baby_shower` | Babyshower / Dåp | 👶 |

**B2B – Bedriftsarrangementer (11 typer, 4 underkategorier)**
| Underkategori | Typer |
|---|---|
| Faglige og strategiske | Konferanse 🎤, Seminar 📋, Kickoff 🎯 |
| Sosiale og relasjonsbyggende | Sommerfest ☀️, Julebord 🎄, Teambuilding 🤝 |
| Eksternt rettede | Produktlansering 🚀, Messe 🏛️ |
| HR og interne markeringer | Jubileumsfeiering 🎊, Galla 🏆, Ansattdag 🙌, Onboarding 🎓 |
| Generelt | Annet bedriftsarrangement 🏢 |

### Hva `event-types.ts` styrer
Hver `EventTypeConfig` definerer hvilke funksjoner som er aktive per arrangementstype:

```typescript
features: {
  traditions: boolean;        // Tradisjoner / Format & Oppsett
  dressTracking: boolean;     // Antrekk / Dresscode
  weddingPartyRoles: boolean; // Bryllupsfølge (kun wedding)
  speeches: boolean;          // Taler / Presentasjoner / Program
  photoplan: boolean;         // Fotoplan
  seating: boolean;           // Bordplassering / Sitteplasser
  coupleProfile: boolean;     // Par-/Arrangørprofil
  importantPeople: boolean;   // Viktige personer
  sharePartner: boolean;      // Del med medarrangør
}
```

I tillegg styrer `event-types.ts`:
- **Rollemerker** (`roleLabels`): Brud/Brudgom → Arrangør/Programansvarlig → HR-ansvarlig/Fadder
- **Datofelter** (`dateLabel`): Bryllupsdato → Konferansedato → Onboarding-dato
- **Gjestemerker** (`guestLabel`): Gjester → Deltakere → Ansatte → Nye ansatte
- **Delingsetiketter** (`shareLabel`): Tilpassede invitasjonstekster per type
- **Q&A-spill** (`qaGames`): Skoleken (bryllup), Icebreaker (bedrift), Quiz, To sannheter/én løgn
- **Antrekkstips** (`attireVendorHints`): Brudekjole → Business casual → Galla
- **Funksjonsmerker** (`featureLabels`): "Tradisjoner" → "Format & Program" → "Onboarding-program"

### 27 leverandørkategorier
`VENDOR_CATEGORIES` i samme fil definerer alle leverandørtyper med:
- Norsk/engelsk label, ikon, gradient, DB-navn, detail-route, aliaser
- `VENDOR_CATEGORY_EVENT_MAP` kobler hvilke kategorier som er relevante for hvilke event-typer

Eksempler:
| Kategori | Gjelder for |
|---|---|
| Fotograf | 16 av 17 typer |
| Catering | Alle 17 typer |
| Blomster | 6 typer (wedding, confirmation, anniversary, engagement, awards, corp. anniversary) |
| Ringer | 2 typer (wedding, engagement) |
| Husdyr | 1 type (wedding) |

### Hva broen løser
CreatorHub er arbeidsflaten for **leverandører** (fotografer, cateringfirmaer, planleggere osv.) som betjener arrangementer booket gjennom Evendi. Uten en bro:

| Problem | Konsekvens |
|---|---|
| Leverandør vet ikke arrangementets program | Går glipp av viktige øyeblikk |
| Arrangør ser ikke leveransestatus | Må mase manuelt |
| Dobbeltregistrering av gjester/tidslinje | Merarbeid og feil |
| Feature-flagg synkroniseres ikke | Leverandør ser funksjoner som ikke er aktive for denne arrangementstypen |

### Overordnet mål
Broen skal gi **sømløs, sanntids dataflyt** mellom arrangør og leverandør — og alltid respektere `event-types.ts` sin konfigurasjon for hvilke funksjoner, roller og etiketter som gjelder for det aktive arrangementet.

### Strategiske prinsipper
1. **Event-type-drevet** – all data filtreres gjennom `EventTypeConfig.features`
2. **Delt database, delte API-er** – begge apper leser/skriver til samme PostgreSQL
3. **API-key-autentisering** – kryssappkall bruker `authenticateApiKey`-middleware
4. **Toveis synkronisering** – data flyter begge veier der det gir mening
5. **Fallback og robusthet** – miljøvariabler med fallback-URLer
6. **Bakoverkompatibilitet** – `/api/wedflow/*` omdirigeres automatisk til `/api/evendi/*`

---

## 2. HVORDAN – Prosess

### Arkitekturoversikt

```
┌─────────────────────┐                              ┌──────────────────────┐
│       EVENDI         │                              │     CREATORHUB       │
│  (Expo/React Native  │                              │  (React + Express)   │
│   + Express server)  │                              │                      │
│                      │                              │                      │
│  Arrangør-appen      │         Delt PostgreSQL      │  Leverandør-         │
│  17 arrangementstyper│◄────────── DATABASE ────────►│  arbeidsflate        │
│  27 vendor-kategorier│                              │  Prosjekter          │
│  Gjester / Tidslinje │                              │  Leveranser          │
│  Budsjett / Sjekkliste                              │  Showcase            │
│                      │                              │  Kontrakter          │
│  ┌────────────────┐  │                              │                      │
│  │shared/          │  │   Delt kilde for            │                      │
│  │event-types.ts   │──────event-typer,──────────────│  (leser fra DB       │
│  │                 │  │   features, kategorier       │   eller API)         │
│  └────────────────┘  │                              │                      │
│                      │                              │                      │
│  ┌────────────────┐  │    HTTP med API-nøkkel       │  ┌────────────────┐  │
│  │/api/creatorhub  │◄──────────────────────────────│  │  Frontend       │  │
│  │ 42 endepunkter  │  │                              │  │  kaller         │  │
│  └────────────────┘  │                              │  │  /api/evendi    │  │
│                      │                              │  └────────────────┘  │
│  ┌────────────────┐  │    HTTP med API-nøkkel       │  ┌────────────────┐  │
│  │  Frontend       │──────────────────────────────►│  │/api/evendi      │  │
│  │  kaller         │  │                              │  │ 65 endepunkter  │  │
│  │  getApiUrl()    │  │                              │  │ + catch-all     │  │
│  └────────────────┘  │                              │  └────────────────┘  │
└─────────────────────┘                              └──────────────────────┘
```

### Dataflyt styrt av event-type

```
Arrangør oppretter arrangement i Evendi
  → Velger type fra EVENT_TYPES (f.eks. "conference")
  → EVENT_TYPE_CONFIGS["conference"].features bestemmer:
      ✅ speeches: true   → Programpunkter synlig for leverandør
      ✅ seating: true    → Sitteplasser synlig
      ❌ weddingPartyRoles: false → Skjult
      ✅ photoplan: true  → Fotoplan synlig
  → VENDOR_CATEGORY_EVENT_MAP filtrerer leverandører:
      ✅ "Fotograf" gjelder for "conference"
      ✅ "Catering" gjelder for "conference"
      ❌ "Ringer" gjelder IKKE for "conference"
  → Leverandør i CreatorHub ser KUN data som er aktivt for denne typen
```

### Teknisk flyt – steg for steg

**1. Evendi → CreatorHub (arrangørdata til leverandør)**
```
Leverandør åpner prosjekt i CreatorHub
  → CreatorHub frontend kaller "/api/evendi/planning/:coupleId"
  → CreatorHub server henter fra delt DB DIREKTE eller
  → CreatorHub server kaller EVENDI_API_URL + "/api/creatorhub/..."
    → Evendi server returnerer data (filtrert etter event-type features)
      → CreatorHub viser til leverandør
```

**2. CreatorHub → Evendi (leverandørdata til arrangør)**
```
Arrangør åpner "Leverandørstatus" i Evendi
  → Evendi frontend kaller getApiUrl() + "/api/vendor/creatorhub-bridge"
  → Evendi server henter data fra delt DB ELLER
  → Evendi server proxyer til CREATORHUB_API_URL
    → CreatorHub returnerer data
      → Evendi viser til arrangør
```

**3. Toveis synk (f.eks. tidslinje)**
```
Arrangør endrer tidslinje i Evendi
  → Lagres i DB (wedding_timeline_events)
  → Leverandør åpner prosjekt i CreatorHub
    → /api/evendi/planning/:coupleId/sync-from-timeline/:projectId
      → Henter siste versjon fra DB → viser i CreatorHub

Leverandør endrer hendelse i CreatorHub
  → /api/evendi/planning/:coupleId/sync-to-timeline/:projectId
    → Skriver tilbake til DB → synlig i Evendi
```

### Leverandørkategori → Arrangementstype-kobling

`VENDOR_CATEGORY_EVENT_MAP` i `event-types.ts` definerer dette. Funksjonen `isVendorCategoryApplicable(category, eventType)` brukes for filtrering i broen.

### Miljøkonfigurasjon

| Variabel | Brukes i | Standardverdi |
|---|---|---|
| `CREATORHUB_API_URL` | Evendi server | `http://localhost:3001` |
| `EVENDI_API_URL` | CreatorHub server | `https://evendi.onrender.com` |
| `EXPO_PUBLIC_CREATORHUB_API_URL` | Evendi klient | Codespaces-deteksjon / `localhost:3001` |
| `API_KEY` | Begge servere | Delt hemmelighet for kryssapp-auth |

### Autentisering mellom appene
- Alle `/api/creatorhub/*`-ruter i Evendi bruker `authenticateApiKey`-middleware
- CreatorHub sender `x-api-key`-header med alle kall til Evendi
- CreatorHub sin catch-all proxy (`app.all('/api/evendi/*')`) videresender automatisk til `EVENDI_API_URL`

---

## 3. HVA – Produkt (nåværende status)

### Broet i dag (21 domener)

| Domene | Retning | Evendi-endepunkt | CreatorHub-endepunkt |
|---|---|---|---|
| **Budsjett** | CH → Evendi | `/api/couple/budget/*` | `/api/evendi/budget/:coupleId` |
| **Sjekkliste + tradisjonsseeding** | CH → Evendi | `/api/checklist/*` | `/api/evendi/checklist/:coupleId` |
| **Chat / Samtaler** | Begge veier | `/api/couples/conversations/*` | `/api/evendi/conversations/*` |
| **Kontakter** | CH → Evendi | Delt DB | `/api/evendi/contacts` |
| **Kontrakter / Tilbud** | Begge veier | `/api/couple/offers/*` | `/api/evendi/contracts/*`, `/api/evendi/offers/*` |
| **Arrangørprofil** | CH → Evendi | `/api/couples/me` | `/api/evendi/couple-profile` |
| **Leveransesporing** | Begge veier | `/api/delivery-track` | `/api/evendi/delivery-track` |
| **Gjester / Deltakere** | CH → Evendi | `/api/couple/guests/*` | `/api/evendi/couple/guests` |
| **Viktige personer** | Begge veier | `/api/couple/important-people/*` | `/api/evendi/important-people/*` |
| **Fotoønsker** | Begge veier | `/api/couple/photo-shots/*` | `/api/evendi/photo-shots-bridge/*` |
| **Planlegging / Tidshendelser** | Begge veier (synk) | `/api/couple/schedule-events/*` | `/api/evendi/planning/:coupleId/*` |
| **Produkter** | CH → Evendi | Delt DB | `/api/evendi/products` |
| **Showcase ↔ Leveranse** | Begge veier | Delt DB | `/api/evendi/showcase-*` |
| **Tidslinjekommentarer** | Begge veier | `/api/vendor/timeline-*` | `/api/evendi/timeline-bridge/:id/*` |
| **Tradisjoner / Format** | CH → Evendi | Delt DB | `/api/evendi/traditions-bridge` |
| **Leverandør-prosjekt-bro** | CH → Evendi | Delt DB | `/api/evendi/vendor-project-bridge` |
| **Vær / Lokasjon / Reise** | Begge veier | `/api/weather/*` | `/api/evendi/weather-location/*` |
| **Invitasjoner** | CH → Evendi | `/api/couple/wedding-invites/*` | `/api/evendi/couple/:coupleId/wedding-invites` |
| **Taler / Program** ✨ | CH → Evendi | `/api/creatorhub/speeches/:coupleId` | `/api/evendi/speeches/:coupleId` |
| **Bordplassering** ✨ | CH → Evendi | `/api/creatorhub/tables/:coupleId` | `/api/evendi/tables/:coupleId` |
| **Musikk / Spillelister** ✨ | CH → Evendi | `/api/creatorhub/music/:coupleId` | `/api/evendi/music/:coupleId` |
| **Koordinatorer** ✨ | CH → Evendi | `/api/creatorhub/coordinators/:coupleId` | `/api/evendi/coordinators/:coupleId` |
| **Anmeldelser** ✨ | CH → Evendi | `/api/creatorhub/reviews/:vendorId` | `/api/evendi/reviews/:vendorId` |

### Tellersammendrag
- **Evendi → CreatorHub-ruter:** 42 endepunkter under `/api/creatorhub/*`
- **CreatorHub → Evendi-ruter:** 65 dedikerte endepunkter + 1 catch-all proxy under `/api/evendi/*`
- **Arrangementstyper:** 17 (6 B2C + 11 B2B) definert i `EVENT_TYPE_CONFIGS`
- **Leverandørkategorier:** 27 slugs i `VENDOR_CATEGORIES`
- **Kultursynk:** 17 kulturelle nøkler (norsk, sikh, indisk, pakistansk, … annet)
- **Q&A-spill:** 5 moduser (shoe_game, quiz, two_truths, qa_open, icebreaker)

---

## 4. CREATORHUB-KOMPONENTER – Hvor bridge-data konsumeres

### Komponentkart

CreatorHub har **15 frontend-komponenter** som aktivt konsumerer Evendi bridge-data:

```
CreatorHub Frontend (frontend/client/src/)
│
├── lib/
│   └── evendi-api.ts                    ← API-klientbibliotek (alle /api/evendi/* kall)
│                                           Speiler EventType, EventTypeFeatures, 
│                                           isEventFeatureEnabled(), getEventTypeLabel()
│
├── components/
│   ├── evendi/
│   │   ├── EvendiImportantPeople.tsx     ← Viktige personer CRUD (599 linjer)
│   │   │     Kall: /api/evendi/contacts
│   │   │           /api/evendi/important-people?coupleId=X
│   │   │           /api/evendi/important-people/:id (PUT/POST/DELETE)
│   │   │
│   │   ├── EvendiOfferManager.tsx        ← Tilbud/kontrakter (544 linjer)
│   │   │     Kall: /api/evendi/offers (GET/POST/DELETE)
│   │   │           /api/evendi/contracts
│   │   │           /api/evendi/contacts
│   │   │
│   │   ├── EvendiSpeeches.tsx            ← ✨ Taler/programpunkter (read-only)
│   │   │     Kall: /api/evendi/speeches/:coupleId
│   │   │     Feature-gated: isEventFeatureEnabled(eventType, 'speeches')
│   │   │     Viser: Talerliste, rekkefølge, varighet, roller, tidspunkt
│   │   │
│   │   ├── EvendiSeating.tsx             ← ✨ Bordplassering (read-only)
│   │   │     Kall: /api/evendi/tables/:coupleId
│   │   │     Feature-gated: isEventFeatureEnabled(eventType, 'seating')
│   │   │     Viser: Bord med kategorier, gjester per bord, setekapasitet
│   │   │
│   │   ├── EvendiMusic.tsx               ← ✨ Musikk/spillelister (read-only)
│   │   │     Kall: /api/evendi/music/:coupleId
│   │   │     Feature-gated: isEventFeatureEnabled(eventType, 'speeches')
│   │   │     Viser: Musikkønsker, opptredener, spillelister, Spotify/YouTube
│   │   │
│   │   ├── EvendiCoordinators.tsx        ← ✨ Koordinatorer/Toastmastere (read-only)
│   │   │     Kall: /api/evendi/coordinators/:coupleId
│   │   │     Viser: Koordinatorliste med roller, tilganger, sist aktiv
│   │   │
│   │   └── EvendiReviews.tsx             ← ✨ Anmeldelser (read-only)
│   │         Kall: /api/evendi/reviews/:vendorId
│   │         Viser: Gjennomsnittsvurdering, fordeling, anmeldelseskort
│   │
│   ├── chat/
│   │   ├── UniversalChatWidget.tsx       ← Arrangør↔Leverandør chat
│   │   │     Kall: /api/evendi/conversations (GET)
│   │   │           /api/evendi/conversations/:id/messages (GET/POST)
│   │   │           /api/evendi/delivery-notify-chat
│   │   │           /api/evendi/delivery-project-bridge
│   │   │
│   │   └── FullscreenChatWidget.tsx      ← Fullskjerm chatvisning
│   │         Kall: /api/evendi/conversations
│   │               /api/evendi/conversations/:id/messages
│   │
│   ├── project/
│   │   └── ProjectCreationWithMemoryCards.tsx  ← Prosjektoppretting med bridge-data
│   │         Kall: /api/evendi/traditions-bridge?coupleId=X
│   │               /api/evendi/photo-shots-bridge?coupleId=X (pull)
│   │               /api/evendi/photo-shots-bridge/push (push)
│   │               /api/evendi/weather-location/sync-from-project/:id
│   │
│   ├── wedding/
│   │   ├── WeddingTimelineAdmin.tsx      ← Tidslinje-administrasjon (hovedkomponent, 11 tabs)
│   │   │     Kall: /api/evendi/traditions-bridge?coupleId=X
│   │   │     Import: EvendiImportantPeople, EvendiSpeeches, EvendiSeating,
│   │   │             EvendiMusic, EvendiCoordinators, EvendiReviews
│   │   │     Tabs: Oversikt | Hendelser | Personer | Taler | Bordplassering |
│   │   │           Musikk | Koordinatorer | Anmeldelser | Klienttilgang |
│   │   │           Innstillinger | Google Drive Backup
│   │   │     Bruker: isEventFeatureEnabled() for feature-gating
│   │   │
│   │   ├── WeddingTimelineOverview.tsx   ← Tidslinjeoversikt
│   │   ├── WeddingTimelineClientView.tsx ← Klientvisning av tidslinje
│   │   ├── WeddingTimelineChangesOverview.tsx ← Endringslogg
│   │   ├── WeddingTimelineClientAccess.tsx    ← Tilgangsstyring
│   │   └── WeddingTimelineEditor.tsx     ← Editor med speech-type events
│   │
│   └── universal/
│       ├── UniversalDashboard.tsx         ← Hoveddashboard (7300+ linjer)
│       │     Kall: /api/evendi/resolve-couple?email=X
│       │     Rendrer: WeddingTimeline*, UniversalChatWidget,
│       │              EvendiTimelineAdmin (via import)
│       │     Tab-struktur per yrke (se under)
│       │
│       └── UniversalShowcase.tsx          ← Showcase-administrasjon
│             Kall: /api/evendi/showcase-create-delivery
│
└── integration/
    └── EnhancedMasterIntegrationProvider.tsx ← Master-integrasjonslag
          Registrerer: evendi:bookings:*, evendi:users:*, evendi:analytics:*
```

### Dashboard tab-struktur (UniversalDashboard)

Leverandøren ser tabs basert på sitt yrke. Bridge-data vises i følgende tabs:

| Tab ID | Label | Bridge-data som vises |
|---|---|---|
| `overview` | Oversikt | Evendi bookings + analytics via `evendi-api.ts` |
| `projects` | Prosjekter | Traditions + photo-shots bridge per `evendiCoupleId` |
| `wedding-timeline` | Tidslinje | Full tidslinjesynk med events, viktige personer, kulturtype |
| `showcase-admin` | Showcase Admin | Showcase ↔ Delivery bridge |
| `showcase-viewer` | Showcase Viewer | Klientvisning med leveransesporing |
| `communication` | Kommunikasjon | Chat-bridge med arrangør via `/api/evendi/conversations` |
| `client-management` | Klientadministrasjon | Resolve couple + kontakter |

### Eksisterende feature-gating i CreatorHub

`evendi-api.ts` har sin egen `isEventFeatureEnabled()` som speiler Evendi sin `event-types.ts`:

```typescript
// Eksempel: WeddingTimelineAdmin sjekker features før visning
if (isEventFeatureEnabled(eventType, 'speeches')) → vis tale-hendelser i tidslinje
if (isEventFeatureEnabled(eventType, 'seating'))  → vis bordplassering
if (isEventFeatureEnabled(eventType, 'photoplan')) → vis fotoplan
```

### DB-felt for tilgangsstyring

Tabellen `couple_vendor_contracts` har kolonner for tilgangsstyring:
```sql
-- Tilgang
can_view_schedule        -- ✅ Leverandør kan se tidslinje
can_view_speeches        -- ✅ Leverandør kan se taler/program
can_view_table_seating   -- ✅ Leverandør kan se bordplassering
can_view_music           -- ✅ Leverandør kan se musikkplan (NY)
can_view_coordinators    -- ✅ Leverandør kan se koordinatorer (NY)
can_view_reviews         -- ✅ Leverandør kan se anmeldelser (NY)

-- Push-varsler
notify_on_schedule_changes -- ✅ Push-varsel ved tidslinjeendring
notify_on_speech_changes   -- ✅ Push-varsel ved taleendring
notify_on_table_changes    -- ✅ Push-varsel ved bordendring
notify_on_music_changes    -- ✅ Push-varsel ved musikkendring (NY)
```

Alle felt er koblet til:
1. **Contract POST/PATCH** – oppretting og oppdatering av avtaler
2. **CreatorHub proxy** – tilgangssjekk i backend-endepunkter
3. **notifyVendorsOfChangeInternal()** – push-varsler ved endringer (4 typer: schedule, speech, table_seating, music)

---

## 5. WORKFLOW – Leverandørens vei gjennom bridge-data

### Navigasjonsflyt i CreatorHub

```
Login → /login
  │
  ▼
UniversalDashboard → /:profession-dashboard-material
  │
  ├── [Oversikt-tab] ──────→ Evendi bookings + analytics
  │
  ├── [Prosjekter-tab] ────→ Velg prosjekt
  │     │                     └── ProjectCreationWithMemoryCards
  │     │                           ├── Traditions bridge → kulturtype
  │     │                           ├── Photo-shots bridge → fotoønsker (pull/push)
  │     │                           └── Weather-location sync
  │     │
  │     └── Åpne tidslinje ──→ [Tidslinje-tab]
  │
  ├── [Tidslinje-tab] ─────→ WeddingTimelineAdmin (11 tabs)
  │     ├── Tidslinjeoversikt (events fra Evendi)
  │     ├── Viktige personer (EvendiImportantPeople)
  │     ├── Kulturtype fra traditions bridge
  │     ├── ✅ Taler/Program (EvendiSpeeches)
  │     ├── ✅ Bordplassering (EvendiSeating)
  │     ├── ✅ Musikk/Spillelister (EvendiMusic)
  │     ├── ✅ Koordinatorer (EvendiCoordinators)
  │     └── ✅ Anmeldelser (EvendiReviews)
  │
  ├── [Kommunikasjon-tab] ──→ UniversalChatWidget
  │     ├── Samtaler med arrangør
  │     ├── Meldinger (push/pull)
  │     └── Leveransevarsler
  │
  └── [Showcase-tab] ──────→ UniversalShowcase
        ├── Showcase → Delivery bridge
        └── Leveransesporing
```

### Dataflyt per bridge-domene

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Arrangør    │     │  Evendi API  │     │ CreatorHub   │     │  Leverandør  │
│  (Evendi app) │     │   (server)   │     │   (server)   │     │ (CreatorHub) │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                     │                     │                     │
  [1] Lager tale ──────────► │                     │                     │
       │                     │ Lagrer i DB         │                     │
       │                     │ (speeches-tabell)   │                     │
       │                     │                     │                     │
       │                     │     ◄──── [2] Leverandør åpner prosjekt ─┤
       │                     │                     │                     │
       │                     │ ─── [3] GET /api/evendi/speeches ───────► │
       │                     │                     │                     │
       │                     │     │ Sjekk contract:                     │
       │                     │     │ can_view_speeches = true?           │
       │                     │     │ Sjekk features:                     │
       │                     │     │ speeches = true for event-type?     │
       │                     │     │                                     │
       │                     │     └──── [4] Returnér JSON ────────────► │
       │                     │                     │                     │
       │                     │                     │      [5] Vises i    │
       │                     │                     │      tidslinje-tab  │
       │                     │                     │                     │
  [6] Ser leverandørens  ◄── │ ◄──── Push-varsel ved endring ──────────┤
      kommentar              │     (notify_on_speech_changes)           │
```

### Workflow for ny bridge (Taler som eksempel)

**Steg 1 – Evendi backend** (`server/routes.ts` eller `server/creatorhub-routes.ts`):
```
Nytt endepunkt: GET /api/creatorhub/speeches/:coupleId
  → Sjekk authenticateApiKey
  → Hent fra speeches-tabell WHERE couple_id = :coupleId
  → Returner { speeches: [...], eventType }
```

**Steg 2 – CreatorHub backend** (`backend/server/index.ts`):
```
Nytt endepunkt: GET /api/evendi/speeches/:coupleId
  → Sjekk kontrakt: can_view_speeches = true
  → Sjekk event-type features via isEventFeatureEnabled()
  → Proxy til EVENDI_API_URL/api/creatorhub/speeches/:coupleId
  → Returner til frontend
```

**Steg 3 – CreatorHub frontend** (ny komponent):
```
Ny fil: components/evendi/EvendiSpeeches.tsx
  → Kall /api/evendi/speeches/:coupleId
  → Vis liste: Taler/programpunkter med navn, rekkefølge, varighet
  → Integreres i WeddingTimelineAdmin som ny seksjon
```

**Steg 4 – Koble til dashboard**:
```
WeddingTimelineAdmin.tsx:
  → Import EvendiSpeeches
  → if (isEventFeatureEnabled(eventType, 'speeches')) → vis panel
```

---

## 6. GAP-ANALYSE – Status per domene

### ✅ Implementert (alle 3 faser fullført)

| Domene | Evendi-endepunkt | DB-felt | CreatorHub-komponent | Status |
|---|---|---|---|---|
| **Taler / Program** | `/api/creatorhub/speeches/:coupleId` | ✅ `can_view_speeches`, `notify_on_speech_changes` | ✅ `EvendiSpeeches.tsx` | ✅ Fase 1 |
| **Bordplassering** | `/api/creatorhub/tables/:coupleId` | ✅ `can_view_table_seating`, `notify_on_table_changes` | ✅ `EvendiSeating.tsx` | ✅ Fase 2 |
| **Musikk / Spillelister** | `/api/creatorhub/music/:coupleId` | ✅ `can_view_music`, `notify_on_music_changes` | ✅ `EvendiMusic.tsx` | ✅ Fase 3 |
| **Koordinatorer** | `/api/creatorhub/coordinators/:coupleId` | ✅ `can_view_coordinators` | ✅ `EvendiCoordinators.tsx` | ✅ Fase 3 |
| **Anmeldelser** | `/api/creatorhub/reviews/:vendorId` | ✅ `can_view_reviews` | ✅ `EvendiReviews.tsx` | ✅ Fase 3 |

Alle domener har:
- Evendi bridge-endepunkt (`/api/creatorhub/*`) med `authenticateApiKey`
- CreatorHub proxy-endepunkt (`/api/evendi/*`) med contract-sjekk
- Frontend-komponent i `components/evendi/`
- Tab i `WeddingTimelineAdmin` (11 tabs totalt)
- Feature-gating via `isEventFeatureEnabled()` der relevant
- Push-varsler via `notifyVendorsOfChangeInternal()` (schedule, speech, table_seating, music)

### Lav prioritet

| Domene | Kommentar |
|---|---|
| Kategori-detaljskjermer | Overlapper med fotoønsker/tidslinjebroer |

### Trenger ikke bro

| Domene | Begrunnelse |
|---|---|
| Påminnelser | Arrangør-privat |
| Aktivitetslogg | Arrangør-privat |
| FAQ / Videoguider / Hva er nytt | App-internt innhold |
| Abonnementsnivåer | Kun fakturering |
| Partnerdeling | Arrangør-private tilgangstokens |
| Inspirasjoner | Innholdsbibliotek, ikke prosjektspesifikt |
| Gjesteinvitasjoner/RSVP | Gjestelisten er allerede broet |

---

## 7. FILREFERANSER

### Evendi (wedflow repo)
| Fil | Rolle |
|---|---|
| [`shared/event-types.ts`](../shared/event-types.ts) | **Kjerneregisteret** — 17 event-typer, features, roller, 27 vendor-kategorier, Q&A-spill, event↔kategori-mapping |
| `server/creatorhub-routes.ts` | 42 endepunkter CreatorHub kaller (inkl. speeches, tables, music, coordinators, reviews) |
| `server/routes.ts` | Vær-proxy, leveransesporing, leverandør-bro-ruter, speeches, tables, musikk + `notifyVendorsOfChangeInternal()` (4 change types) |
| `shared/schema.ts` | Drizzle ORM-skjema med tilgangsfelter i `coupleVendorContracts` |
| `migrations/0037_add_bridge_access_fields.sql` | DB-migrasjon for `can_view_music`, `can_view_coordinators`, `can_view_reviews`, `notify_on_music_changes` |
| `client/components/VendorCreatorHubBridge.tsx` | Leverandør ser CreatorHub-prosjekter |
| `client/lib/api-weather-location-bridge.ts` | Vær/lokasjon/reise-hjelpefunksjoner |
| `client/screens/DeliveryAccessScreen.tsx` | Arrangør-leveransetilgang |

### CreatorHub (Creatorhubn-monorepo)
| Fil | Rolle |
|---|---|
| `frontend/client/src/lib/evendi-api.ts` | **API-klient** — typer, helpers, feature-gating, auth, React Query keys |
| `frontend/client/src/components/evendi/EvendiImportantPeople.tsx` | Viktige personer CRUD (599 linjer) |
| `frontend/client/src/components/evendi/EvendiOfferManager.tsx` | Tilbud/kontrakter (544 linjer) |
| `frontend/client/src/components/evendi/EvendiSpeeches.tsx` | ✨ Taler/programpunkter (read-only, feature-gated) |
| `frontend/client/src/components/evendi/EvendiSeating.tsx` | ✨ Bordplassering (read-only, feature-gated) |
| `frontend/client/src/components/evendi/EvendiMusic.tsx` | ✨ Musikk/spillelister (read-only, feature-gated) |
| `frontend/client/src/components/evendi/EvendiCoordinators.tsx` | ✨ Koordinatorer/toastmastere (read-only) |
| `frontend/client/src/components/evendi/EvendiReviews.tsx` | ✨ Anmeldelser med vurderingsfordeling (read-only) |
| `frontend/client/src/components/chat/UniversalChatWidget.tsx` | Arrangør↔Leverandør chat |
| `frontend/client/src/components/chat/FullscreenChatWidget.tsx` | Fullskjerm chatvisning |
| `frontend/client/src/components/project/ProjectCreationWithMemoryCards.tsx` | Prosjektoppretting med traditions/photo-shots/weather bridge |
| `frontend/client/src/components/wedding/WeddingTimelineAdmin.tsx` | Tidslinje-administrasjon (11 tabs, hovednav for bridge-data) |
| `frontend/client/src/components/wedding/WeddingTimelineEditor.tsx` | Editor med speech-type events |
| `frontend/client/src/components/universal/UniversalDashboard.tsx` | Hoveddashboard med tab-struktur |
| `frontend/client/src/components/universal/UniversalShowcase.tsx` | Showcase → Delivery bridge |
| `frontend/client/src/hooks/use-toast.ts` | Toast-varslingssystem (MUI Snackbar) |
| `frontend/client/src/components/ui/toaster.tsx` | Toast-renderer |
| `backend/server/index.ts` | 65 `/api/evendi/*`-endepunkter + catch-all proxy |
| `backend/server/tradition-checklists.ts` | Tradisjonsspesifikke sjekklisteelementer (17 kulturer) |

---

## 8. IMPLEMENTERINGSLOGG – Alle faser fullført

### ✅ Fase 1: Taler / Programpunkter

1. **`server/creatorhub-routes.ts`** → `GET /api/creatorhub/speeches/:coupleId` (henter fra `speeches`-tabell, filtrerer private felt)
2. **`backend/server/index.ts`** → `GET /api/evendi/speeches/:coupleId` med contract-sjekk (`can_view_speeches`)
3. **`components/evendi/EvendiSpeeches.tsx`** → Talerliste med navn, rolle, varighet, rekkefølge, tidspunkt
4. **`WeddingTimelineAdmin.tsx`** → Tab 3 (Taler/Program), feature-gated bak `speeches`

### ✅ Fase 2: Bordplassering

1. **`server/creatorhub-routes.ts`** → `GET /api/creatorhub/tables/:coupleId` (henter fra `weddingTables` + `tableGuestAssignments` + `weddingGuests`)
2. **`backend/server/index.ts`** → `GET /api/evendi/tables/:coupleId` med contract-sjekk (`can_view_table_seating`)
3. **`components/evendi/EvendiSeating.tsx`** → Bordkart med kategorier, gjester, kapasitet
4. **`WeddingTimelineAdmin.tsx`** → Tab 4 (Bordplassering), feature-gated bak `seating`

### ✅ Fase 3: Musikk / Koordinatorer / Anmeldelser

**DB-migrasjon:** `migrations/0037_add_bridge_access_fields.sql`
- `can_view_music`, `notify_on_music_changes`, `can_view_coordinators`, `can_view_reviews`

**Musikk:**
1. **`server/creatorhub-routes.ts`** → `GET /api/creatorhub/music/:coupleId` (performances + setlists + preferences)
2. **`backend/server/index.ts`** → `GET /api/evendi/music/:coupleId` med contract-sjekk (`can_view_music`)
3. **`components/evendi/EvendiMusic.tsx`** → Musikkønsker, opptredener, spillelister med Spotify/YouTube-lenker
4. **`WeddingTimelineAdmin.tsx`** → Tab 5 (Musikk), feature-gated bak `speeches`

**Koordinatorer:**
1. **`server/creatorhub-routes.ts`** → `GET /api/creatorhub/coordinators/:coupleId` (aktive koordinatorinvitasjoner)
2. **`backend/server/index.ts`** → `GET /api/evendi/coordinators/:coupleId` med contract-sjekk (`can_view_coordinators`)
3. **`components/evendi/EvendiCoordinators.tsx`** → Koordinatorliste med roller, tilganger, sist aktiv
4. **`WeddingTimelineAdmin.tsx`** → Tab 6 (Koordinatorer)

**Anmeldelser:**
1. **`server/creatorhub-routes.ts`** → `GET /api/creatorhub/reviews/:vendorId` (godkjente anmeldelser + leverandørsvar)
2. **`backend/server/index.ts`** → `GET /api/evendi/reviews/:vendorId` (ingen contract-sjekk, offentlige data)
3. **`components/evendi/EvendiReviews.tsx`** → Vurderingsfordeling, anmeldelseskort med leverandørsvar
4. **`WeddingTimelineAdmin.tsx`** → Tab 7 (Anmeldelser)

### Push-varsler (notifyVendorsOfChangeInternal)

Konfigurasjonsdrevet helper i `routes.ts` med 4 endringstyper:

| Type | Trigger | Tittel | DB-felt |
|---|---|---|---|
| `schedule` | Tidslinje CRUD | Programendring | `notifyOnScheduleChanges` |
| `speech` | Tale CRUD | Talelisteendring | `notifyOnSpeechChanges` |
| `table_seating` | Bord/gjesteplassering CRUD | Bordplasseringsendring | `notifyOnTableChanges` |
| `music` | Opptreden/spilleliste CRUD | Musikkendring | `notifyOnMusicChanges` |

### Kontraktendepunkter

`POST /api/couple/vendor-contracts` og `PATCH /api/couple/vendor-contracts/:id` håndterer nå alle 10 tilgangs-/varselfelter.
