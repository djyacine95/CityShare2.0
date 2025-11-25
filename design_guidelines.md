# CityShare Design Guidelines

## Design Approach

**Reference-Based Strategy**: Drawing inspiration from **Airbnb** (trust-building, item showcasing) combined with **Linear** (clean typography, efficient workflows) and eco-conscious brand aesthetics.

**Core Philosophy**: Build trust through transparency, make browsing delightful, streamline transactions, celebrate sustainability impact.

---

## Typography

**Font Stack** (via Google Fonts):
- **Primary**: Inter (400, 500, 600, 700) - UI, body text, buttons
- **Headings**: Outfit (600, 700) - distinctive, friendly headers

**Hierarchy**:
- Page Titles: text-4xl font-bold (Outfit)
- Section Headers: text-2xl font-semibold (Outfit)
- Card Titles: text-lg font-semibold (Inter)
- Body Text: text-base font-normal (Inter)
- Captions/Metadata: text-sm font-medium (Inter)
- Small Labels: text-xs font-medium uppercase tracking-wide (Inter)

---

## Layout System

**Spacing Scale**: Tailwind units **4, 6, 8, 12, 16, 20, 24**
- Component padding: p-4 to p-8
- Section spacing: py-16 to py-24
- Card gaps: gap-6
- Element margins: mb-6, mt-8

**Grid Patterns**:
- Item listings: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Feature sections: grid-cols-1 lg:grid-cols-2
- Profile/Dashboard: 2-column split (sidebar + content)

**Containers**: max-w-7xl mx-auto px-4 for main content

---

## Component Library

### Navigation
**Header**: Sticky navigation with logo left, search center, user menu right
- Height: h-16 on mobile, h-20 on desktop
- Shadow: shadow-sm for subtle depth
- User avatar with notification badge
- Mobile: Hamburger menu with slide-out drawer

### Item Cards
**Design**: Rounded corners (rounded-xl), shadow on hover (hover:shadow-lg transition)
- Image: aspect-square or aspect-4/3, rounded-t-xl, object-cover
- Content padding: p-4
- Title + category badge at top
- Distance + availability indicators
- Star rating + price/status
- "Add to wishlist" heart icon (top-right overlay on image)

### Hero Section
**Layout**: Full-width with large background image showing community sharing
- Image: Blurred gradient overlay with people exchanging items
- Content: Centered, max-w-3xl
- Search bar: Prominent, rounded-full with shadow-xl, integrated category dropdown
- Stats bar below: "X items shared | Y tons CO2 saved | Z active members"

### Search & Filters
**Filter Panel**: Collapsible sidebar (desktop) or bottom sheet (mobile)
- Category chips with icons
- Distance slider with map preview
- Date range picker for availability
- "Verified owners only" toggle

### Messaging Interface
**Chat Window**: Split-screen layout (desktop) or full-screen (mobile)
- Left: Conversation list with avatars, last message preview
- Right: Message thread with timestamps, read receipts
- Input: Sticky bottom bar with attachment button
- User verification badge visible in chat header

### Booking Calendar
**Design**: Inline calendar component (react-calendar style)
- Selected dates: rounded-full highlights
- Unavailable dates: strikethrough, muted
- Pickup/return clearly distinguished (different treatments)
- Summary card showing total days, cost (if any)

### Profile Pages
**Layout**: Cover photo + avatar overlay
- Verification badge next to name (large, prominent)
- Stats row: Items listed | Items borrowed | Rating | Eco-impact
- Tabs: Listings | Reviews | About
- Reviews: Card-based with star rating, timestamp, transaction context

### Impact Tracker Dashboard
**Visualization**: Card grid with illustrated icons
- "Items Reused" counter with animation
- "CO2 Saved" with tree equivalent
- "Waste Prevented" with weight metric
- Progress bars toward community goals
- Timeline graph showing personal impact over time

### Wishlist
**Grid View**: Similar to item cards but with additional controls
- "Alerts active" indicator (bell icon)
- Quick remove button
- Notification settings per item

### Forms & Inputs
**Style**: Rounded inputs (rounded-lg) with focus:ring treatment
- Labels: text-sm font-medium mb-2
- Required fields: asterisk in accent color
- File upload: Drag-drop zone with preview thumbnails
- Success states: Green checkmark with micro-animation

### Buttons
**Primary**: Rounded-lg, font-semibold, px-6 py-3
- On images: backdrop-blur-sm with semi-transparent background
- Icon + text combinations where helpful
- Loading states: Spinner replaces text

### Badges & Indicators
**Verification Badge**: Shield icon with "Verified" text, rounded-full
**Category Tags**: Small, rounded-full, subtle background
**Status Pills**: "Available", "Borrowed", "Pending" with appropriate visual weight
**Distance Indicator**: Location pin + "X miles away"

---

## Images

**Hero Section**: Large, high-quality photo (1920x800px) showing diverse people sharing items in urban setting - warm, friendly atmosphere with natural lighting. Blurred gradient overlay (dark-to-transparent) for text readability.

**Item Cards**: User-uploaded photos, aspect-square (1:1) or 4:3. Placeholder: Subtle gradient with category icon if no image.

**Profile Covers**: Optional banner images (1200x300px), defaults to subtle gradient if not set.

**Impact Tracker**: Illustrated icons/graphics for environmental metrics - modern, minimalist style with eco-friendly aesthetic.

**Empty States**: Friendly illustrations for "No results", "No messages", "Empty wishlist" - lighthearted, encouraging tone.

---

## Accessibility

- Focus indicators: 2px ring with offset
- Color contrast minimum: WCAG AA
- Keyboard navigation: All interactive elements
- Screen reader labels: Comprehensive aria-labels
- Form validation: Inline error messages with icons
- Touch targets: Minimum 44x44px (mobile)

---

## Animations

**Minimal & Purposeful**:
- Card hover: Slight lift (translateY) + shadow increase
- Page transitions: Fade-in for new views
- Counter animations: Number roll-up for impact stats
- Success states: Checkmark draw animation
- Loading: Subtle skeleton screens, no spinners unless necessary

---

## Mobile Considerations

- Bottom navigation for primary actions
- Swipe gestures for message list
- Pull-to-refresh on listings
- Sticky search/filter button
- Expandable item cards (tap to see full details)
- Map view toggle for location-based search