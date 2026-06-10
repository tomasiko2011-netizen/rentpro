# Graph Report - .  (2026-06-11)

## Corpus Check
- Corpus is ~32,056 words - fits in a single context window. You may not need a graph.

## Summary
- 432 nodes · 1004 edges · 21 communities (17 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Booking and Property API Routes|Booking and Property API Routes]]
- [[_COMMUNITY_Dashboard and Landing Pages|Dashboard and Landing Pages]]
- [[_COMMUNITY_UI Components and Layout|UI Components and Layout]]
- [[_COMMUNITY_Package Dependencies Config|Package Dependencies Config]]
- [[_COMMUNITY_Booking Flow and Kaspi Payment|Booking Flow and Kaspi Payment]]
- [[_COMMUNITY_Component Registry and Aliases|Component Registry and Aliases]]
- [[_COMMUNITY_WhatsApp Bot Handlers|WhatsApp Bot Handlers]]
- [[_COMMUNITY_TypeScript Compiler Config|TypeScript Compiler Config]]
- [[_COMMUNITY_iCal Export and Seed Routes|iCal Export and Seed Routes]]
- [[_COMMUNITY_Calendar Grid Component|Calendar Grid Component]]
- [[_COMMUNITY_PWA Web Manifest|PWA Web Manifest]]
- [[_COMMUNITY_App Layout and Notifications|App Layout and Notifications]]
- [[_COMMUNITY_Docs and CI Workflow|Docs and CI Workflow]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Vercel Cron Config|Vercel Cron Config]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 79 edges
2. `db` - 28 edges
3. `Button()` - 24 edges
4. `Card()` - 19 edges
5. `CardContent()` - 19 edges
6. `Input()` - 17 edges
7. `authOptions` - 17 edges
8. `properties` - 16 edges
9. `compilerOptions` - 16 edges
10. `Badge()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `BookingsPage()` --calls--> `usePusherRefresh()`  [EXTRACTED]
  app/(dashboard)/bookings/page.tsx → lib/use-pusher.ts
- `CalendarPage()` --calls--> `usePusherRefresh()`  [EXTRACTED]
  app/(dashboard)/calendar/page.tsx → lib/use-pusher.ts
- `POST()` --calls--> `syncICalFeed()`  [EXTRACTED]
  app/api/channels/ical/[listingId]/sync/route.ts → lib/ical-sync.ts
- `POST()` --calls--> `syncICalFeed()`  [EXTRACTED]
  app/api/channels/ical/route.ts → lib/ical-sync.ts
- `GET()` --calls--> `generateICS()`  [EXTRACTED]
  app/api/ical/[propertyId]/route.ts → lib/ical.ts

## Import Cycles
- None detected.

## Communities (21 total, 4 thin omitted)

### Community 0 - "Booking and Property API Routes"
Cohesion: 0.06
Nodes (26): client, db, blockedDates, bookings, bookingsRelations, channelListings, channels, cleanings (+18 more)

### Community 1 - "Dashboard and Landing Pages"
Cohesion: 0.09
Nodes (35): Stats, features, plans, BookingDialogProps, Property, STATUS_LABELS, Feed, PLATFORMS (+27 more)

### Community 2 - "UI Components and Layout"
Cohesion: 0.05
Nodes (50): nav, cn(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+42 more)

### Community 3 - "Package Dependencies Config"
Cohesion: 0.05
Nodes (39): dependencies, @base-ui/react, bcryptjs, class-variance-authority, clsx, drizzle-orm, @libsql/client, lucide-react (+31 more)

### Community 4 - "Booking Flow and Kaspi Payment"
Cohesion: 0.10
Nodes (26): POST(), BookingsPage(), POST(), CalendarPage(), POST(), checkAvailability(), createKaspiPayment(), formatPaymentMessage() (+18 more)

### Community 5 - "Component Registry and Aliases"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 6 - "WhatsApp Bot Handlers"
Cohesion: 0.18
Nodes (17): cleanSessions(), clearSession(), getSession(), handleIncomingMessage(), parseDate(), sessions, setSession(), blockDates() (+9 more)

### Community 7 - "TypeScript Compiler Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "iCal Export and Seed Routes"
Cohesion: 0.29
Nodes (10): addDays(), extractDate(), foldLine(), generateICS(), ICalEvent, parseDuration(), parseICS(), toICalDate() (+2 more)

### Community 9 - "Calendar Grid Component"
Cohesion: 0.22
Nodes (7): Booking, CalendarGrid(), CalendarGridProps, dateStr(), Property, SOURCE_LABELS, STATUS_COLORS

### Community 10 - "PWA Web Manifest"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 11 - "App Layout and Notifications"
Cohesion: 0.33
Nodes (4): geistMono, geistSans, metadata, Toaster()

### Community 12 - "Docs and CI Workflow"
Cohesion: 0.50
Nodes (4): Next.js Custom Agent Rules (Breaking Changes), Next.js, Vercel Platform, GitHub Actions CI Build (lint + build)

## Knowledge Gaps
- **123 isolated node(s):** `Stats`, `STATUS_LABELS`, `Feed`, `Property`, `PLATFORMS` (+118 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Components and Layout` to `Calendar Grid Component`, `Dashboard and Landing Pages`?**
  _High betweenness centrality (0.170) - this node is a cross-community bridge._
- **Why does `Button()` connect `Dashboard and Landing Pages` to `Calendar Grid Component`, `UI Components and Layout`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `Stats`, `STATUS_LABELS`, `Feed` to the rest of the system?**
  _124 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Booking and Property API Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.057181942544459644 - nodes in this community are weakly interconnected._
- **Should `Dashboard and Landing Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.09063535079795243 - nodes in this community are weakly interconnected._
- **Should `UI Components and Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.0525879917184265 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies Config` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._