# Mohammed Vasi Khan — Neural Portfolio

A portfolio explored as a living 3D graph. The graph is the navigation: selecting a neuron expands its branch, moves the camera, and reveals the selected node's story in a connected output panel. There are no stacked webpage sections or primary navigation menu.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. A regular production deployment uses `npm run build` followed by `npm start`.

## Explore

- Click or tap a neuron to reveal its immediate children and connected content.
- Scroll over the graph, or swipe vertically, to travel through its revealed connections.
- Use arrow keys or Page Up / Page Down to move through the graph. Tab and Enter focus and select the visible graph nodes.
- Escape or the curved arrow returns to the previous visited node. Home or the origin control collapses the graph and resets exploration.
- Scroll within the output panel to read long content without moving the camera.
- The pause control stops ambient motion while keeping intentional navigation available. Lite mode reduces rendering cost.

Mouse hover softly highlights neurons and adjacent connections. Branch animations grow each connection outward before revealing the child, with staggered timing. GSAP camera transitions are cancelled and replaced on new selections. The camera maintains a stable horizon and a bounded amount of pointer parallax.

## Architecture

The Next.js page loads public GitHub repository data, then passes it to the client-side graph. `src/data/neuralGraph.js` provides hierarchical content. `src/utils/graphModel.mjs` compiles deterministic XYZ positions and provides the pure navigation reducer. Components under `src/components/neural` render nodes, edges, signals, and content; hooks under `src/hooks` connect navigation and camera animation.

See `docs/neural-interface-architecture.md` for the structure, state contract, and eight implementation milestones.

## Customize

- Profile/contact information, featured repository order, images, and experience: `src/config/config.js`.
- Hierarchy, node content, and skill branches: `src/data/neuralGraph.js`.
- Visual theme, output-panel layouts, and responsive rules: `src/app/globals.css`.
- Graph layout and navigation behavior: `src/utils/graphModel.mjs`.
- Responsive camera framing: `src/utils/cameraFrame.mjs`.
- Portrait: `public/profile.png`; social preview: `public/og.png`.

GitHub data refreshes hourly on the regular Next.js deployment and uses a local fallback if unavailable. All configured featured projects remain available even when fallback metadata is incomplete. `GITHUB_TOKEN` is optional and server-side only. Set `NEXT_PUBLIC_SITE_URL` to the canonical deployment origin; Vercel's production project URL is also supported.

## Performance and fallback

The Three.js scene loads separately from the content shell. Signals use instancing, node geometry is shared, and connections use lightweight line geometry. The scene avoids postprocessing and shadow maps. Rendering density is capped at 1 on touch devices and 1.5 on desktop, with an automatic reduction on slow rendering.

Hidden tabs, paused ambient motion, and system reduced-motion preferences stop continuous rendering. GSAP requests frames only while intentional camera/branch transitions need them. Reduced motion completes these transitions immediately. On WebGL failure or context loss, a projected interactive graph preserves branch navigation and content. Enable JavaScript for graph interaction; the no-script notice retains a contact link.

## Checks

```sh
node --test tests/graphModel.test.mjs
npm run build
```

The graph suite checks progressive visibility, hidden-node rejection, idempotent expansion, navigation history, rapid transitions, reset generations, complete content reachability, and Three.js camera projections at eight desktop/mobile viewport sizes. Browser interaction and actual device frame-rate checks are separate and were unavailable in this environment.

`NEXT_DIST_DIR=.next-build` keeps a regular validation build separate from a development preview. With `NEXT_STATIC_EXPORT=1`, Next.js exports a static preview into the selected directory; its GitHub data is a publication-time snapshot. The hosted preview preserves the normal Next.js source architecture.
