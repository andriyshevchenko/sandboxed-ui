# Planning Guide

A secure, browser-based secrets manager that allows users to safely store, organize, and retrieve sensitive information like passwords, API keys, and credentials with client-side encryption.

**Experience Qualities**: 
1. **Secure** - Users should feel confident their sensitive data is protected through visual security indicators and clear encryption status
2. **Organized** - A clean, categorized interface that makes finding and managing secrets effortless
3. **Professional** - A polished, trustworthy aesthetic that communicates reliability and attention to detail

**Complexity Level**: Light Application (multiple features with basic state)
This app manages secrets with CRUD operations, categorization, search, and clipboard integration - representing a focused tool with several interconnected features but not requiring complex routing or data relationships.

## Essential Features

**Add New Secret**
- Functionality: Create a new secret entry with title, value, category, and optional notes
- Purpose: Allow users to securely store sensitive information
- Trigger: Click "Add Secret" button or use keyboard shortcut
- Progression: Click add button → Form dialog opens → Fill in details → Click save → Secret encrypted and stored → Confirmation toast → Dialog closes → Secret appears in list
- Success criteria: Secret is stored encrypted, appears in the list, and can be retrieved successfully

**View & Copy Secrets**
- Functionality: Display secrets in a list/grid, reveal values on demand, copy to clipboard
- Purpose: Quick access to stored credentials without manual typing
- Trigger: Click on a secret card or use copy button
- Progression: Click secret → Value revealed with masked/unmasked toggle → Click copy icon → Value copied to clipboard → Success feedback → Auto-hide after timeout
- Success criteria: Values are initially hidden, reveal smoothly, copy successfully, and provide clear feedback

**Search & Filter**
- Functionality: Filter secrets by name, category, or tags in real-time
- Purpose: Quickly locate specific secrets in a growing collection
- Trigger: Type in search bar or select category filter
- Progression: Type in search → Results filter instantly → Empty state shows if no matches → Clear search returns full list
- Success criteria: Search is instant, matches are highlighted, empty states are helpful

**Edit & Delete Secrets**
- Functionality: Modify existing secret details or remove secrets permanently
- Purpose: Keep secrets current and remove obsolete entries
- Trigger: Click edit/delete icon on secret card
- Progression: Click edit → Form pre-filled with current data → Make changes → Save → Updated secret re-encrypted → Confirmation | Click delete → Confirmation dialog → Confirm → Secret removed → Success toast
- Success criteria: Edits persist correctly, deletions are confirmed, no orphaned data remains

**Category Management**
- Functionality: Organize secrets into categories (Passwords, API Keys, Notes, etc.)
- Purpose: Logical grouping for better organization
- Trigger: Select category during secret creation or filter view
- Progression: Assign category when creating → Secret tagged → Filter by category → Only matching secrets shown
- Success criteria: Categories are visually distinct, filtering is accurate

## Edge Case Handling

- **No Secrets Yet**: Display an attractive empty state with illustration and clear call-to-action to add first secret
- **Long Secret Values**: Truncate display with ellipsis, provide scroll or expand option in detail view
- **Duplicate Names**: Allow duplicates but show category/date to differentiate
- **Invalid Input**: Validate required fields (title, value) with inline error messages before allowing save
- **Search No Results**: Show helpful "No secrets found" message with option to clear filters
- **Clipboard Failure**: Graceful fallback with error toast if clipboard API unavailable

## Design Direction

The design should evoke trust, clarity, and modern professionalism. A dark, sophisticated interface with cybersecurity-inspired aesthetics - think encrypted vaults, secure terminals, and digital protection. The UI should feel polished and premium while maintaining excellent readability and intuitive interactions.

## Color Selection

A sophisticated dark theme with vibrant accent colors to create a secure, high-tech aesthetic reminiscent of security software and encrypted systems.

- **Primary Color**: Deep indigo `oklch(0.25 0.08 265)` - Represents security, trust, and technology
- **Secondary Colors**: 
  - Background: Rich charcoal `oklch(0.15 0.01 265)` - Professional dark foundation
  - Surface: Elevated slate `oklch(0.20 0.02 265)` - Card backgrounds with subtle depth
- **Accent Color**: Electric cyan `oklch(0.75 0.15 195)` - High-tech highlight for CTAs and important actions
- **Foreground/Background Pairings**: 
  - Primary (Deep Indigo): White text `oklch(0.98 0 0)` - Ratio 8.2:1 ✓
  - Background (Rich Charcoal): Light slate text `oklch(0.85 0.01 265)` - Ratio 9.1:1 ✓
  - Accent (Electric Cyan): Dark text `oklch(0.15 0.01 265)` - Ratio 10.5:1 ✓
  - Surface (Elevated Slate): Light text `oklch(0.90 0.01 265)` - Ratio 11.8:1 ✓

## Font Selection

Typography should convey technical precision while maintaining excellent readability - a modern monospace for secrets and a clean sans-serif for UI elements.

- **Typographic Hierarchy**: 
  - H1 (Page Title): Space Grotesk Bold / 32px / tight letter spacing
  - H2 (Section Headers): Space Grotesk SemiBold / 20px / normal spacing
  - Body (UI Text): Space Grotesk Regular / 15px / normal spacing / line-height 1.6
  - Secret Values: JetBrains Mono Regular / 14px / mono spacing / line-height 1.5
  - Labels: Space Grotesk Medium / 13px / wide letter spacing (0.02em)

## Animations

Animations should reinforce the feeling of security and precision - smooth, purposeful transitions that guide the user through actions. Favor subtle fades and slides over bouncy effects.

Key moments: (1) Secret reveal/hide with smooth opacity transitions and subtle scale, (2) Copy-to-clipboard success with a quick checkmark animation, (3) Dialog entry with gentle fade + slide from center, (4) List items stagger in on load for polish, (5) Hover states with soft glow effects on interactive elements.

## Component Selection

- **Components**: 
  - Dialog: For add/edit secret forms with overlay
  - Card: Secret display items with hover states and action buttons
  - Input & Textarea: Form fields for secret details
  - Button: Primary (accent color), secondary (outline), destructive (delete)
  - Badge: Category tags with color coding
  - Alert Dialog: Delete confirmation
  - Command: Quick search/filter palette (Cmd+K)
  - Tooltip: Icon button explanations
  - Scroll Area: For long secret lists
  - Separator: Visual dividers between sections

- **Customizations**: 
  - Custom masked input component that toggles between password dots and plain text
  - Copy button with animated success state (icon morphs to checkmark)
  - Empty state illustration with animated lock icon
  - Secret strength indicator for password entries

- **States**: 
  - Buttons: Default with subtle glow on primary, hover brightens + slight scale, active scales down, disabled reduces opacity
  - Inputs: Default with subtle border, focus shows accent ring and brightens border, error shows red border with shake animation
  - Cards: Default elevated, hover lifts with shadow increase, active/selected shows accent border

- **Icon Selection**: 
  - Plus: Add new secret
  - Eye / EyeSlash: Toggle secret visibility
  - Copy: Copy to clipboard (morphs to Check on success)
  - PencilSimple: Edit secret
  - Trash: Delete secret
  - MagnifyingGlass: Search
  - LockKey: App icon and empty state
  - Tag: Categories
  - Folders: Category grouping

- **Spacing**: 
  - Container padding: p-6
  - Card padding: p-4
  - Form field gaps: gap-4
  - Grid gaps: gap-3
  - Button padding: px-4 py-2
  - Section margins: mb-6

- **Mobile**: 
  - Single column card layout instead of grid
  - Bottom sheet drawer for add/edit forms on mobile instead of centered dialog
  - Larger touch targets (min 44px) for action buttons
  - Simplified header with hamburger menu for filters
  - Sticky search bar at top
  - Floating action button (FAB) for "Add Secret" in bottom-right corner on mobile
