# HANDYFLIX

A Netflix-style free streaming website built with Next.js 16 (App Router), React 19, and Tailwind CSS v4.

## Architecture

- **Framework**: Next.js 16 with App Router, TypeScript
- **Styling**: Tailwind CSS v4 with oklch color system, custom glass-pill design tokens
- **Video Player**: Native HTML5 `<video>` element with custom controls UI (no external player library)
- **API**: External backend at `https://apii.freehandyflix.online/api` — provides homepage content, search, info, and video sources
- **Ads**: Adsterra integration (banner + video overlay)
- **State**: Client-side only (localStorage for My List)
- **Package Manager**: pnpm

## Key Pages

| Route | Description |
|---|---|
| `/` | Homepage with hero, categories, genre rails |
| `/movie/[id]` | Movie detail with trailer, play, download |
| `/series/[id]` | Series detail with season/episode picker |
| `/search` | Full-text search |
| `/my-list` | Saved content (localStorage) |
| `/terms` | Terms of service |

## API Routes

| Route | Purpose |
|---|---|
| `/api/download` | SSRF-protected proxy redirect for video downloads (edge runtime, trusted domains allowlist) |
| `/api/download-stats` | Download statistics endpoint |

## Key Components

- `components/video-player.tsx` — Custom video player with quality switching, subtitles, playback speed, mobile gestures (double-tap seek), keyboard shortcuts, fullscreen, error handling
- `components/movie-detail.tsx` / `series-detail.tsx` — Content detail pages
- `components/navbar.tsx` — Fixed top navigation with mobile drawer
- `components/hero-section.tsx` — Homepage hero carousel
- `components/genre-rail.tsx` / `genre-section.tsx` — Horizontal content scrollers
- `lib/api.ts` — API client with response normalization (raw API → NormalizedContent)
- `lib/api-config.ts` — Single source of truth for API base URL
- `lib/my-list.ts` — localStorage-based watchlist

## Development

```bash
pnpm run dev   # starts on port 5000, bound to 0.0.0.0
```

## Notes

- Video player was migrated from ReactPlayer to native HTML5 video for better compatibility and fewer CORS issues
- The app auto-searches for French dubbed versions via `fetchInfo()` (doubles API calls per content page)
- Download proxy validates URLs against a trusted domains allowlist to prevent SSRF
