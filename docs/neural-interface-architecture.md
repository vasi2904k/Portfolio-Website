# Neural interface architecture

The neural graph remains the primary UI. Existing content, hierarchy, typography, and connected story panel are retained.

## Diagnosis and control choice

The active route uses components/neural/NeuralNetwork; the older NeuralExperience and NeuralCanvas are not mounted. The guided state machine already prevented arbitrary pathway travel, but its camera hook wrote a fixed pose each frame. An orbit controller added alongside it would be overwritten. Wheel input only traveled; the single-pointer mobile handler had no native pinch or pan. The background was a sparse point field without branching tissue.

OrbitControls now owns normal exploration, and GSAP temporarily owns the camera during focus. ArcballControls was considered against its documented touch/focus behavior. OrbitControls was selected because direct polar/azimuth limits, target-radius limits, damping, and combined touch dolly/pan fit the requirement for bounded exploration and a stable horizon. Node-aware focus remains in the application so it participates in navigation transactions.

Official references: https://threejs.org/docs/pages/OrbitControls.html and https://threejs.org/docs/pages/ArcballControls.html.

## State contract

The pure graphModel.mjs reducer owns currentNode, selectedNode, navigationHistory, parentNode, activePath, expandedNodes, readyNodes, cameraTarget, cameraPosition, navigationDepth, isAnimating, phase, and revision. `parentNode` is the previous visited location exposed to the controls; it is deliberately not assumed to be the current node's structural parent. hoveredNode and focusedNode distinguish mouse and keyboard focus. contentNode retains the last completed output during a transition; visited preserves exploration progress.

Flow: IDLE / HOVER ? SELECT (or BACK) ? CAMERA_FOCUS ? EXPAND_BRANCH ? CONTENT_VIEW.

Navigation rejects conflicting input until camera focus and staggered expansion complete. Each edge grows before its child appears. Revision checks discard callbacks belonging to an interrupted transition. Recenter is the deliberate exception: it can interrupt focus or expansion, keeps the active path, and completes any pending branch reveal after recovery. Reduced motion and the non-WebGL fallback use the same transaction.

Camera pose snapshots are debounced after movement instead of causing a React render every frame. They never determine graph location. Back pops the actual visit history and reconstructs the destination's ancestry when crossing branches. Root clears history, collapses branches, and preserves the broader visited-progress record.

## Input ownership

- Desktop pointer movement supplies subtle ambient parallax, left drag orbits, and ordinary wheel input travels the active pathway. Ctrl/Cmd-wheel and trackpad pinch zoom. Browser keyboard zoom remains native.
- Mobile one-finger gestures lock to an axis after a short threshold: vertical swipes travel, while horizontal drags orbit. Pinch and two-finger drag remain owned by OrbitControls for zoom and pan.
- A capture-phase wheel router prevents the native controller and pathway handler from consuming the same event. Zoom targets accumulate into a short eased tween; travel needs a 90-pixel threshold and a 240 ms quiet gap between bursts. Events received while locked consume their burst.
- useSceneGestures centralizes pointer classification and separates pointer-up activation from drag, multi-touch, and cancellation. Taps permit at most 10 px travel and 650 ms. Swipes need 64 px vertical travel, a 1.4 direction ratio, and less than 1000 ms. Double activation uses a 320 ms interval; it cancels the pending single activation.
- OrbitControls captures pointers on the viewport, including projected HTML labels. Activation records the original label/mesh hit before capture so dragging from a neuron cannot accidentally activate it.
- Arrow keys focus available neurons; Enter selects; Escape goes Back; Home returns to Root; R recenters; + / ? zoom; Page Up/Down travel.
- Content retains native scrolling. Scene touch-action is none; content supports pan-y. Help and Map suspend scene input and return focus when closed.

## Camera and responsive labels

OrbitControls owns ordinary camera motion. Distance is limited relative to the fitted branch, azimuth and polar limits prevent flipping, and panning stays within 2 world units on touch / 3 on desktop (or less for a small branch). Camera recovery checks the projected active neuron periodically; Recenter restores a useful distance and upright orientation.

The active neuron's world position is the orbit target. PerspectiveCamera.setViewOffset reserves space for the connected story panel without orbiting an artificial offset target. cameraFrame.mjs shares the usable graph rectangle with the label layout. Resizing and opening a mobile story reframe through a fresh camera transaction.

nodeLabels.mjs resolves label collisions in screen space. Labels keep a minimum 44 px tap width and 54 px layout height, with leader lines back to the actual neurons. Mobile cores are enlarged. Only current/child labels take keyboard focus; surrounding branches remain visible as dimmed context.

On portrait mobile, READ STORY expands content. Leaf stories open automatically; closing a branch story restores child labels and graph space. Landscape uses the side panel with touch controls. The accessible Map and projected fallback share the same graph state.

## Living environment

neuralEnvironment.mjs generates deterministic world-space geometry: a distant ellipsoidal neural field, two loose hemispheres of dendritic tissue, connecting axons, dust, and fog volumes. The middle layer recursively forks curved fibers. Mobile tissue has a narrower spatial distribution so reduced counts still surround the graph.

NeuralEnvironment.jsx renders the distant field using points and batched lines. All dendrites share one BufferGeometry and shader; bodies/halos and fixed signal pools use InstancedMesh. A shared phase produces subtle matching sway in fibers, bodies, and signals. Activation briefly boosts nearby tissue and directs part of the signal pool to nearby paths. The environment has no interactive raycasts.

Fog is a set of actual instanced spherical volumes. A shader intersects the view ray with each sphere and samples three-dimensional noise six times through the volume. This provides depth-dependent density without a fullscreen postprocessing chain. All layers move with world-space parallax when the camera orbits, pans, or zooms.

neuralPalette.mjs supplies green and blue/silver palettes and three quality presets. Background colors/opacity stay subdued; foreground connections are sharper, and selected nodes receive the strongest emphasis. Mobile/Lite lower dendrite depth, cluster/particle/signal/fog counts and pixel density. Buffers and Three.js scratch objects are reused; listeners, tweens, timers and geometry are cleaned up. Paused/hidden/reduced-motion views use demand rendering; intentional controls invalidate frames as needed.

## Project synchronization

The server prefers one authenticated GraphQL query and falls back to public REST requests with bounded README/language enrichment. Static deployments refresh the same public repository list in the browser, enrich at most twelve priority repositories with four-way concurrency, and cache the structured result for one hour. Stable GitHub database IDs survive renames, while a successful refresh naturally removes deleted repositories. Graph updates are applied only while the visitor is idle at Root, then a SYNC_GRAPH reducer action reconciles visibility and ready-state without creating a competing navigation controller.

## Validation

npm test checks state sequencing, emergency recovery, pose invariants, actual OrbitControls limits, full content reachability, wheel momentum, touch classification, deterministic finite environment geometry, and framing/label collisions at nine viewport sizes.

npm run test:browser covers the live DOM/WebGL integration in Chrome, Firefox, an Android Chrome profile, and an iPhone WebKit profile. Coverage includes branch/Back/Root/breadcrumb navigation, mouse orbit and wheel routing, double activation, emergency Recenter, reduced motion, palette changes, accessible Map, context-loss fallback, and native Chromium multi-touch rotation/pinch/pan/swipe. Background shader errors and excessive draw calls are checked during branch exploration.

Mobile profiles are emulation. Physical Android/iOS hardware, installed mobile Safari, real trackpad hardware, VoiceOver/TalkBack, and hardware frame-rate measurements require manual device validation. Synthetic wheel input and native Chromium touch injection verify routing but cannot reproduce every hardware event cadence.
