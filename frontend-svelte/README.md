# Svelte Portfolio

A Svelte/SvelteKit version of the AI consulting portfolio, built as a learning project.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── routes/              # Pages (file-based routing)
│   ├── +layout.svelte   # Shared layout
│   ├── +page.svelte     # Home page (/)
│   ├── about/
│   ├── projects/
│   ├── consulting/
│   └── contact/
├── lib/
│   ├── components/      # Reusable components
│   ├── stores/          # Global state (Svelte stores)
│   ├── i18n/            # Internationalization
│   └── utils/           # Helper functions
└── app.css              # Global styles
```

## Learning Resources

1. **Start here:** Read `LEARNING-PLAN.md`
2. **Migration guides:** Check `migration-guides/` folder
3. **Official tutorial:** [learn.svelte.dev](https://learn.svelte.dev)

## Comparing to React Version

The original React code is in `../frontend/src/`. Use it as reference while building:

| React | Svelte |
|-------|--------|
| `frontend/src/pages/HomePage.tsx` | `src/routes/+page.svelte` |
| `frontend/src/pages/AboutPage.tsx` | `src/routes/about/+page.svelte` |
| `frontend/src/components/` | `src/lib/components/` |

## Key Differences from React

- **No useState** - Just use `let variable = value`
- **No useEffect** - Use `$:` for reactive statements
- **No className** - Use `class` directly
- **Built-in transitions** - Import from `svelte/transition`
- **Scoped styles** - `<style>` blocks are scoped by default

## Development Tips

1. Keep the Svelte REPL open: [svelte.dev/repl](https://svelte.dev/repl)
2. Reference migration guides while building each section
3. Start simple, add complexity gradually
4. Use CSS for simple hover animations (better performance)

Happy learning!
