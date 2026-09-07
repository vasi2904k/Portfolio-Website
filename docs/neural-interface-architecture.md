# Neural interface architecture

The neural graph is the application surface. The page hosts one fixed 3D viewport; portfolio content emerges in an output panel attached to the selected graph node. There are no scrollable page sections or conventional navigation menus.

## Structure

- `src/data/neuralGraph.js`: portfolio content and hierarchical relationships; imports the existing profile/config and repository records.
- `src/utils/graphModel.mjs`: deterministic XYZ layout, graph indexes, visible/expanded states, traversal, and navigation reducer. Pure functions, independently testable.
- `src/hooks/useNeuralNetwork.js`: React bridge for selection, expansion, history, forward/back traversal, and reset.
- `src/hooks/useCameraAnimation.js`: cancellable GSAP camera interpolation, bounded pointer parallax, and responsive framing.
- `src/components/neural/NeuralNetwork.jsx`: viewport, input routing, quality/motion preferences, and WebGL fallback.
- `src/components/neural/NeuralScene.jsx`: R3F Canvas, shared resources, camera, and graph composition.
- `src/components/neural/NeuralNode.jsx`: glowing 3D neuron, accessible projected label, hover/selection feedback.
- `src/components/neural/NeuralConnection.jsx`: outward-growing connection paths.
- `src/components/neural/NeuralParticles.jsx`: batched traveling signals and restrained ambient particles.
- `src/components/neural/ContentOutput.jsx`: selected node content, accessible actions, and a projected tether.
- `tests/graphModel.test.mjs`: graph/navigation invariant checks.

## State and animation contract

Initial visibility is root plus five primary branches. An expanded parent reveals only immediate children. Selection and expansion are independent flags; a node can be both. Visual state derives from visibility, spawn readiness, selection, expansion, and hover. New connections grow from parent to child; child visibility/hit targets follow the connection tip. GSAP timelines are cancelled on cleanup and callbacks must match the current expansion generation. Camera animations are replaced by the latest selection, never queued.

Navigation uses stable node IDs. A dynamically expanded depth-first traversal powers wheel, swipe, and next/previous controls. Internal back history is distinct from graph ancestry. Reset restores the collapsed initial network and clears in-flight input. Wheel events inside content panels remain normal panel scrolling. Browser zoom modifiers are preserved.

## Incremental milestones

1. Working fullscreen scene: six nodes, camera, lighting, depth, and animated connections.
2. Accessible node hover and selection.
3. Data-driven branch expansion and navigation reducer.
4. Staggered edge growth followed by node spawning.
5. Responsive, interruptible camera framing and subtle parallax.
6. Scroll/swipe traversal, history, reset, and keyboard input.
7. Bounded instanced signals constrained to revealed edges.
8. Connected output panels with the existing real portfolio content.

Each milestone extends the working scene. Reduced motion completes intentional navigation immediately; it does not disable exploration. WebGL failure retains the same branch-based navigation in a projected graph. Rendering density and particle counts adapt to the device, and ambient animation stops in hidden tabs.

## Implementation record

All eight milestones are implemented. Phase 1 was compiled and served successfully before the branch, camera, input, signal, and output phases were added. The final graph model and camera projections have an automated 18-case test suite. A source review covered React event readiness, interrupted animation cleanup, WebGL recovery, visible keyboard focus, output reset, and aligned responsive breakpoints. Browser visual/interaction testing was unavailable; hardware frame rates have not been measured.
