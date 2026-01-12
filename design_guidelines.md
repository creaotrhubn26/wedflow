# Wedflow - Wedding Planning App Design Guidelines

## 1. Brand Identity

**App Name**: Wedflow by Norwedfilm
**Purpose**: A comprehensive wedding planning app for Scandinavian couples to organize their special day - managing schedules, guests, table seating, speeches, and coordination with vendors.

**Aesthetic Direction**: **Dark Elegance** — A sophisticated dark theme with warm gold accents. The design evokes luxury and romance, with a premium feel that matches the importance of the wedding day.

**Memorable Element**: The contrast between the deep black backgrounds and warm antique gold creates an unmistakable premium aesthetic. Typography is refined and editorial.

## 2. Color Palette

**Background Primary**: #1A1A1A (Rich Black) — Main app background
**Background Secondary**: #252525 — Cards, elevated surfaces
**Background Tertiary**: #2D2D2D — Input fields, secondary cards
**Accent/Gold**: #C9A962 (Antique Gold) — CTAs, highlights, icons, active states
**Accent Light**: #E5D4A1 — Lighter gold for text on dark
**Text Primary**: #FFFFFF (Pure White) — Headings, primary text
**Text Secondary**: #A0A0A0 — Secondary text, labels
**Text Muted**: #6B6B6B — Placeholder text
**Border**: #3A3A3A — Card borders, dividers
**Success**: #4CAF50
**Error**: #EF5350
**Surface White**: #FAFAFA — Light mode cards if needed

## 3. Typography

**Primary Font**: System default (San Francisco on iOS)
**Heading Style**: Clean, elegant with generous letter-spacing

**Type Scale**:
- H1: 28pt Bold — Screen titles
- H2: 22pt SemiBold — Section headers
- H3: 18pt SemiBold — Card titles
- Body: 16pt Regular — Main content
- Caption: 14pt Regular — Secondary info
- Small: 12pt Regular — Labels, timestamps

## 4. Navigation Architecture

**Root Navigation**: Bottom Tab Bar (4 tabs)

**Tab 1 - Planlegging (Planning)**:
- Main dashboard with wedding date countdown
- Quick access cards: Kjøreplan, Varslinger, Viktige personer
- Wedding overview

**Tab 2 - Inspirasjon (Inspiration)**:
- Photo gallery grid with wedding inspiration
- Categories: Bryllup, Dekorasjoner, Blomster, etc.

**Tab 3 - Gjester (Guests)**:
- Guest list with RSVP status
- Add/edit guests
- Table seating (Bordplassering)
- Speech list (Taleliste)

**Tab 4 - Profil (Profile)**:
- Couple info and wedding details
- Settings
- Photo plan (Fotoplan)

## 5. Screen Specifications

### Planning Dashboard (Tab 1)
- **Header**: App logo "Wedflow" with gold W icon
- **Layout**: Scrollable with cards
- **Components**: 
  - Countdown to wedding date
  - Kjøreplan card (day schedule)
  - Notifications card
  - Important people quick access
- **Safe Area**: Top: headerHeight + Spacing.lg, Bottom: tabBarHeight + Spacing.lg

### Kjøreplan (Schedule)
- **Header**: "Kjøreplan" with date subtitle
- **Layout**: Timeline list
- **Components**: Time blocks with event names and icons
- **Features**: Add/edit events with time picker

### Invitasjoner (Guest List)
- **Header**: "Invitasjoner" with guest count
- **Layout**: List view with search
- **Components**: Guest cards with avatar, name, RSVP status
- **Empty State**: Illustration with "Ingen gjester lagt til"

### Bordplassering (Table Seating)
- **Header**: "Bordplassering" 
- **Layout**: Visual grid of tables
- **Components**: Circular table icons with seat numbers
- **Features**: Drag to assign guests, reserved indicator

### Taleliste (Speech List)
- **Header**: "Taleliste"
- **Layout**: Ordered list
- **Components**: Speaker name, time slot, role
- **Features**: Reorder speeches, add new

### Viktige personer (Important People)
- **Header**: "Viktige personer"
- **Layout**: List with roles
- **Components**: Person card with name, role (Toastmaster, Forlover, etc.)

### Inspirasjon (Inspiration)
- **Header**: "Inspirasjon"
- **Layout**: 2-column masonry grid
- **Components**: Image cards with category labels
- **Categories**: Bryllup, Dekorasjoner, Bordpynt, Blomster

### Fotoplan (Photo Plan)
- **Header**: "Fotoplan"
- **Layout**: Checklist
- **Components**: Photo shot items with checkboxes
- **Features**: Group photos, portraits, ceremony shots

## 6. Visual Design Specifications

**Cards**:
- Background: #252525
- Border: 1px solid #3A3A3A
- Border Radius: 16px
- Padding: 16px

**Buttons**:
- Primary: Gold (#C9A962) background, dark text
- Secondary: Transparent with gold border
- Press opacity: 0.8

**Icons**:
- Style: Feather icons
- Active: Gold (#C9A962)
- Inactive: #6B6B6B

**Inputs**:
- Background: #2D2D2D
- Border: 1px solid #3A3A3A
- Border Radius: 12px
- Text: White
- Placeholder: #6B6B6B

## 7. Assets Required

**App Icon**: Elegant "W" lettermark with flowing lines in gold on dark background
**Splash Icon**: Same as app icon
**Empty States**:
- empty-guests.png: Elegant illustration for empty guest list
- empty-schedule.png: Calendar illustration for empty schedule
- empty-inspiration.png: Gallery frame illustration

## 8. Interactions

- Haptic feedback on button presses
- Smooth transitions between screens
- Pull-to-refresh on lists
- Subtle press feedback on cards (opacity 0.9)
- Spring animations on modals

## 9. Language

Primary language: Norwegian (Bokmål)
- Planlegging = Planning
- Kjøreplan = Schedule/Timeline
- Invitasjoner = Invitations
- Bordplassering = Table Seating
- Taleliste = Speech List
- Viktige personer = Important People
- Inspirasjon = Inspiration
- Fotoplan = Photo Plan
- Gjester = Guests
- Profil = Profile
