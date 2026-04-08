# ReadLoot UX Audit

Audited: 2026-04-08
Scope: All 13 frontend files (10 pages, navbar, layout, middleware)

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 4 |
| Important | 14 |
| Nice-to-have | 10 |

The app has solid foundations - good empty states, gamification feedback, and mobile nav. The biggest gaps are: no error boundaries or 404 page (crashes show blank screens), no loading skeletons (content pops in), missing form validation, and accessibility holes throughout.

---

## Critical (Blocks Usage)

### C1. No `not-found.tsx` or `error.tsx` - broken URLs show blank/crash
- **Where**: `app/` root
- **Issue**: No `not-found.tsx`, no `error.tsx`, no `global-error.tsx`. Navigating to `/nonexistent` shows the default Next.js error or a blank page. An unhandled JS error in any page crashes the entire app with no recovery.
- **Fix**: Add `app/not-found.tsx` (friendly 404 with link home) and `app/error.tsx` (error boundary with retry button).

### C2. Dashboard shows nothing while loading - no loading state
- **Where**: `app/page.tsx`
- **Issue**: Three parallel queries (`wotd`, `profile`, `dueWords`) all have no loading indicator. The page renders an empty `<div className="space-y-6">` with just the header until all queries resolve. On slow connections, users see a blank page for seconds.
- **Fix**: Add skeleton cards or a spinner while `profile.isLoading` is true.

### C3. Review page - answer mutation error is silently swallowed
- **Where**: `app/review/page.tsx`
- **Issue**: `answerMutation` has no `onError` handler. If the API call to submit an answer fails (network error, 500), nothing happens - the user is stuck on the current word with no feedback and no way to retry.
- **Fix**: Add `onError` to `answerMutation` showing an error message with a retry option.

### C4. Review page - `completeMutation` error is silently swallowed
- **Where**: `app/review/page.tsx`
- **Issue**: If `completeReview` API fails, the user finishes all words but never sees the summary. No error handler, no retry. XP and streak data are lost.
- **Fix**: Add `onError` to `completeMutation` with retry button. Consider optimistic local summary as fallback.

---

## Important (Hurts Experience)

### I1. Login - no client-side validation
- **Where**: `app/login/page.tsx`
- **Issue**: Only `required` HTML attribute. No minimum password length, no username format validation. Users can submit a 1-character password and get a cryptic API error.
- **Fix**: Add min length (e.g., 3 for username, 6 for password) with inline error messages before submission.

### I2. Login - no password requirements shown during registration
- **Where**: `app/login/page.tsx`
- **Issue**: When in Register mode, there's no indication of password requirements. Users discover constraints only after a failed submission.
- **Fix**: Show password requirements text below the password field when `!isLogin`.

### I3. Add Word - no client-side validation beyond `required`
- **Where**: `app/add/page.tsx`
- **Issue**: No max length enforcement on any field. A user could paste a 10,000-character "meaning" and only discover the limit from an API error. No duplicate word detection before submission.
- **Fix**: Add `maxLength` attributes, show character counts for textarea fields, and warn on potential duplicates (debounced check).

### I4. Add Word - book/chapter name not remembered
- **Where**: `app/add/page.tsx`
- **Issue**: After adding a word, `bookName` and `chapterName` are NOT reset (good), but there's no autocomplete from existing books/chapters. Users must type exact names every time, risking typos that create duplicate books ("Sapiens" vs "sapiens").
- **Fix**: Add a combobox/autocomplete for book name (from `getBooks()`) and chapter name (from `getBookDetails()`).

### I5. Search - error state is hidden
- **Where**: `app/search/page.tsx`
- **Issue**: The `catch` block sets `results` to empty array and `searched` to true, making API errors look identical to "no results found". Users can't distinguish between "nothing matched" and "the search broke".
- **Fix**: Track error state separately and show a distinct error message with retry.

### I6. Search - no result limit or pagination
- **Where**: `app/search/page.tsx`
- **Issue**: If a user has 500 words and searches "the", all matching results render at once. No pagination, no virtual scrolling, no result cap.
- **Fix**: Add pagination or "load more" button. Consider limiting initial results to 20-50.

### I7. Books page - no error state
- **Where**: `app/books/page.tsx`
- **Issue**: `books.isError` is never checked. If the API fails, the page shows nothing after loading text disappears (loading is only shown while `isLoading` is true, then data is null, so nothing renders).
- **Fix**: Add error state with retry button.

### I8. Book Detail - no error state, no 404 handling
- **Where**: `app/books/[name]/page.tsx`
- **Issue**: If the book name doesn't exist, the API returns 404 but the page just shows the header with no content. No "book not found" message. Also no error state for network failures.
- **Fix**: Handle `book.isError` - show "Book not found" for 404, generic error with retry for other failures.

### I9. Stats page - returns `null` when no data
- **Where**: `app/stats/page.tsx`
- **Issue**: `if (!data) return null;` renders a completely blank page if the profile query fails silently. No error state, no empty state for new users.
- **Fix**: Handle error state explicitly. Show empty state for new users (0 XP).

### I10. Achievements page - no error state
- **Where**: `app/achievements/page.tsx`
- **Issue**: If `achievements.isError`, the page shows nothing. The loading text disappears and the page is blank.
- **Fix**: Add error state with retry.

### I11. Settings - export error is silently swallowed
- **Where**: `app/settings/page.tsx`
- **Issue**: `handleExport` catch block is empty (`// silently fail`). If export fails, the button just stops spinning with no feedback.
- **Fix**: Show an error toast or inline error message.

### I12. Settings - no "system" theme option
- **Where**: `app/settings/page.tsx`
- **Issue**: Only Light/Dark toggle, but `defaultTheme` in layout is "system". Users who prefer system theme have no way to select it in settings.
- **Fix**: Add a "System" option to the theme toggle.

### I13. Mobile nav - Search, Achievements, Settings not accessible
- **Where**: `components/navbar.tsx`
- **Issue**: `mobileItems` only includes Home, Add, Review, Books, Stats. Search, Achievements, and Settings are completely inaccessible on mobile unless the user knows the URL. There's no hamburger menu or "more" option.
- **Fix**: Add a "More" tab that opens a sheet/drawer with the remaining items, or use a scrollable bottom bar.

### I14. Navbar - no aria labels, no keyboard focus indicators
- **Where**: `components/navbar.tsx`
- **Issue**: Nav links have no `aria-label` or `aria-current="page"` for active state. The mobile bottom bar has no `role="navigation"` or `aria-label`. No visible focus ring on keyboard navigation.
- **Fix**: Add `aria-label="Main navigation"` to `<nav>`, `aria-current="page"` to active links, and ensure focus-visible rings are styled.

---

## Nice-to-have (Polish)

### N1. No loading skeletons anywhere
- **Where**: All pages
- **Issue**: Every page uses plain text ("Loading books...", "Loading stats...", "Loading achievements...") instead of skeleton UI. This feels unpolished compared to the otherwise well-designed gamification system.
- **Fix**: Replace text loading states with skeleton cards matching the layout of the loaded content.

### N2. Dashboard - WOTD error state is misleading
- **Where**: `app/page.tsx`
- **Issue**: When `wotd.isError && !isEmpty`, it shows "No Word of the Day yet. Add some words to get started!" - but the error could be a network failure, not an empty vault. The message is wrong for users who have words but the API is down.
- **Fix**: Distinguish between 404 (no WOTD available) and other errors.

### N3. Add Word - success message uses `text-accent` which may have low contrast
- **Where**: `app/add/page.tsx`
- **Issue**: Success message uses `text-accent bg-accent/10`. In light mode, accent is `hsl(170, 60%, 45%)` on a 10% tint background. This teal-on-light-teal may not meet WCAG AA contrast ratio (4.5:1).
- **Fix**: Verify contrast ratio. Consider using a dedicated success color or `text-green-700`/`text-green-400` for dark mode.

### N4. Review - no keyboard shortcut to submit answer
- **Where**: `app/review/page.tsx`
- **Issue**: Enter key works for submit (form), but there's no keyboard shortcut for "Next Word" after feedback. Users must click the button or tab to it.
- **Fix**: Add Enter key handler in feedback state to advance to next word.

### N5. Review - no "skip" option
- **Where**: `app/review/page.tsx`
- **Issue**: If a user is stuck on a word, there's no way to skip it. They must submit a wrong answer to proceed.
- **Fix**: Add a "Skip" or "I don't know" button that counts as incorrect but feels less punishing.

### N6. Book Detail - chapters not expandable to show words
- **Where**: `app/books/[name]/page.tsx`
- **Issue**: Chapters show word count but not the actual words. Users can't browse their vocabulary by chapter without going to Search.
- **Fix**: Make chapters expandable (accordion) to show the words within each chapter.

### N7. No offline fallback page
- **Where**: PWA config
- **Issue**: `next-pwa` is configured but disabled in development. In production, the default service worker caches pages, but there's no custom offline fallback page. If the user opens the PWA without network, they get the browser's default offline page.
- **Fix**: Add `public/offline.html` or `app/offline/page.tsx` and configure `next-pwa` to use it as fallback.

### N8. Level-up overlay - no keyboard dismiss
- **Where**: `components/gamification/level-up-overlay.tsx`
- **Issue**: Overlay says "Tap anywhere to dismiss" but has no keyboard handler. Pressing Escape does nothing. The overlay traps visual focus but doesn't manage focus properly (no `role="dialog"`, no `aria-modal`).
- **Fix**: Add Escape key handler, `role="dialog"`, `aria-modal="true"`, and trap focus within the overlay.

### N9. Achievement toast - no `role="alert"` or `aria-live`
- **Where**: `components/gamification/achievement-toast.tsx`
- **Issue**: Achievement toasts appear visually but screen readers won't announce them. No `role="alert"` or `aria-live="polite"`.
- **Fix**: Add `role="status"` and `aria-live="polite"` to the toast container.

### N10. Book Detail - `params.name` usage may need `use()` in Next.js 14+
- **Where**: `app/books/[name]/page.tsx`
- **Issue**: Direct access to `params.name` in a client component. In newer Next.js versions, `params` is a Promise and should be unwrapped with `React.use()`. This may cause a console warning or break in future Next.js updates.
- **Fix**: Use `const { name } = React.use(params)` or convert to a server component wrapper that passes the param as a prop.

---

## Cross-cutting Patterns

### Error handling summary

| Page | Loading | Error | Empty | Retry |
|------|---------|-------|-------|-------|
| Dashboard | ❌ None | ❌ Partial (WOTD only, misleading) | ✅ Good | ❌ No |
| Login | ✅ Button text | ✅ Inline message | N/A | N/A |
| Add Word | ✅ Button text | ✅ Inline message | N/A | N/A |
| Review | ✅ Text | ✅ Empty state | ✅ Good | ❌ No |
| Search | ✅ Text | ❌ Hidden as "no results" | ✅ Good | ❌ No |
| Books | ✅ Text | ❌ None | ✅ Good | ❌ No |
| Book Detail | ✅ Text | ❌ None | N/A | ❌ No |
| Stats | ✅ Text | ❌ Returns null | N/A | ❌ No |
| Achievements | ✅ Text | ❌ None | N/A | ❌ No |
| Settings | N/A | ❌ Silent fail (export) | N/A | ❌ No |

### Accessibility summary

- ❌ No skip-to-content link
- ❌ No `aria-current="page"` on active nav items
- ❌ No `role="navigation"` with labels on nav elements
- ❌ No focus management after route changes
- ❌ Gamification overlays lack ARIA roles and keyboard handling
- ✅ Form inputs have labels (via `<label htmlFor>`)
- ✅ HTML `lang="en"` is set
- ✅ Semantic heading hierarchy (h1 on each page)

### Mobile summary

- ✅ Bottom tab bar with 5 key items
- ✅ Responsive grid layouts (grid-cols-1 md:grid-cols-2)
- ❌ 3 pages inaccessible from mobile nav (Search, Achievements, Settings)
- ✅ Login page has `px-4` padding for mobile
- ✅ Cards stack vertically on small screens

---

## Recommended Fix Order

1. **C1** - Add `not-found.tsx` + `error.tsx` (prevents blank screens)
2. **C3/C4** - Add error handlers to review mutations (prevents stuck sessions)
3. **C2** - Add dashboard loading state (first thing users see)
4. **I13** - Fix mobile nav to include all pages
5. **I7/I8/I9/I10** - Add error states to Books, Book Detail, Stats, Achievements
6. **I5** - Fix search error vs empty distinction
7. **I1/I2/I3** - Add form validation (login + add word)
8. **I4** - Add book/chapter autocomplete
9. **I14** - Navbar accessibility
10. **N1** - Loading skeletons
11. **N8/N9** - Gamification accessibility
12. Everything else

---

## Sources

- Direct code review of all 13 files in `/local/home/sdad/Personal/readloot/frontend/`
- WCAG 2.1 AA guidelines for contrast and accessibility checks
- Next.js 14 App Router conventions for error/not-found pages
