# Mohammed Vasi Khan — Neural Portfolio

A portfolio explored as a living 3D graph. The graph is the navigation: selecting a neuron expands its branch, moves the camera, and reveals the selected node's story in a connected output panel. There are no stacked webpage sections or primary navigation menu.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. A regular production deployment uses `npm run build` followed by `npm start`.

## Explore

The bright foreground neurons are the portfolio. The quieter branching tissue around them is a real 3D environment.

- **Desktop:** left-drag to orbit; wheel, trackpad pinch, or + / ? to zoom. Select **TRAVEL** to make the wheel follow the active pathway instead. Shift + wheel temporarily travels without changing modes.
- **Mobile:** one finger orbits in **EXPLORE**; pinch zooms; two-finger drag pans nearby. In **TRAVEL**, swipe up enters a child and swipe down returns to the parent. Pinch and two-finger pan remain available in both modes.
- Click/tap activates a neuron. Double click/tap focuses it; double activation of the current neuron restores its camera view.
- **? BACK** follows the parent. **? ROOT** collapses branches and preserves exploration progress. **? RECENTER** or R restores the active branch, including during a transition.
- The breadcrumb shows the current path. **MAP** opens a readable, keyboard-accessible outline of revealed branches.
- Arrow keys move focus; Enter activates; Escape goes Back; Home returns to Root; Page Down / Page Up travel deeper / back.
- On portrait mobile, **READ STORY** opens the connected content panel. Scroll inside content to read without moving through the graph.
- The palette control switches between neural green and blue/silver. Pause stops ambient motion; Lite reduces background complexity.

Camera focus finishes before connections grow and children appear in sequence. Navigation locks during this transaction. A single wheel burst can travel only one step, including momentum that outlasts the animation. Zoom and orbit never change the active path. Camera distance, rotation, elevation, and pan remain bounded around the selected neuron.

## Architecture

The Next.js page loads public GitHub repository data, then passes it to the client-side graph. `src/data/neuralGraph.js` provides hierarchical content. `src/utils/graphModel.mjs` compiles deterministic XYZ positions and provides the pure navigation reducer. Components under `src/components/neural` render nodes, edges, signals, and content; hooks under `src/hooks` connect navigation and camera animation.

See `docs/neural-interface-architecture.md` for the navigation diagnosis, state contract, input rules, and validation coverage.

## Customize

- Profile/contact information, featured repository order, images, and experience: `src/config/config.js`.
- Hierarchy, node content, and skill branches: `src/data/neuralGraph.js`.
- Visual theme, output-panel layouts, and responsive rules: `src/app/globals.css`.
- Graph layout and navigation behavior: `src/utils/graphModel.mjs`.
- Responsive camera framing and orbit limits: `src/utils/cameraFrame.mjs`, `src/utils/orbitCamera.mjs`.
- Green and blue/silver palettes and quality presets: `src/config/neuralPalette.mjs`.
- Procedural neural tissue and volumetric atmosphere: `src/utils/neuralEnvironment.mjs`, `src/components/neural/NeuralEnvironment.jsx`.
- Portrait: `public/profile.png`; social preview: `public/og.png`.

GitHub data refreshes hourly on the regular Next.js deployment and uses a local fallback if unavailable. All configured featured projects remain available even when fallback metadata is incomplete. `GITHUB_TOKEN` is optional and server-side only. Set `NEXT_PUBLIC_SITE_URL` to the canonical deployment origin; Vercel's production project URL is also supported.

## Performance and fallback

The Three.js scene loads separately from the content shell. Distant nodes and fibers use BufferGeometry; branching tissue is batched into a single line draw. Neuron bodies, halos, signals, and fog volumes use instancing. Signals reuse a fixed pool, and fog uses six density samples per volume without a fullscreen postprocessing pass. Desktop, mobile, and Lite presets retain all environment layers with different object counts. Rendering density is capped at 1 on touch devices and 1.5 on desktop, with automatic reduction on slow rendering.

Hidden tabs, paused ambient motion, and system reduced-motion preferences stop continuous rendering. GSAP requests frames while intentional camera/branch transitions need them. Reduced motion completes these transitions immediately through the same state machine. Projected labels resolve collisions and retain large hit areas, with subtle leaders attaching them to their neurons. On WebGL failure or context loss, a projected interactive graph preserves branch navigation and content. The Map also provides a readable alternative during normal 3D use. Enable JavaScript for graph interaction; the no-script notice retains a contact link.

## Checks

```sh
npm test
npm run lint
npm run build
npx playwright install firefox webkit
npm run test:browser
```

The browser configuration uses an installed Chrome plus Playwright Firefox and WebKit. Android Chrome and iPhone WebKit profiles emulate mobile viewports and touch; they do not certify physical devices or the installed Safari application. Native multi-touch injection is tested in Chromium. Actual iOS/Android device performance and VoiceOver/TalkBack remain manual checks.

`NEXT_DIST_DIR=.next-build` keeps a validation build separate from a development preview. With `NEXT_STATIC_EXPORT=1`, Next.js exports a static preview into the selected directory; its GitHub data is a publication-time snapshot. The normal Next.js deployment retains live revalidation.
