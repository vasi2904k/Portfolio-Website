"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { clampZoom, configureOrbit, getOrbitFrame, setOrbitGestureMode } from "@/utils/orbitCamera.mjs";

export default function useCameraAnimation({ graph, state, compact, reduced, touchDevice, panelExpanded, viewportRef, cameraApi, suspended, onCameraStarted, onCameraSettled, onCameraPose, onRecenter, onInteraction }) {
  const { camera, size, invalidate } = useThree();
  const controls = useMemo(() => new OrbitControls(camera), [camera]);
  const transition = useRef(null), zoomTween = useRef(null), snapshotTimer = useRef();
  const initialized = useRef(false), framing = useRef(null), dragging = useRef(false), safetyClock = useRef(0);
  const projected = useMemo(() => new Vector3(), []), offset = useMemo(() => new Vector3(), []);
  const pose = useRef({ x: 0, y: 0, z: 23, tx: 0, ty: 0, tz: 0, ox: 0, oy: 0 });
  const zoom = useRef({ distance: 23 }), zoomDestination = useRef(null);
  const latest = useRef();
  latest.current = { state, reduced, suspended, onCameraPose, onRecenter, onInteraction };
  const snapshot = useMemo(() => () => {
    const value = latest.current;
    value.onCameraPose(camera.position.toArray(), controls.target.toArray(), value.state.revision);
  }, [camera, controls]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    controls.connect(element);
    const change = () => {
      invalidate();
      clearTimeout(snapshotTimer.current);
      if (!transition.current) snapshotTimer.current = setTimeout(snapshot, 180);
    };
    const start = () => { dragging.current = true; zoomTween.current?.kill(); zoomDestination.current = null; };
    const end = () => { dragging.current = false; change(); };
    const visible = () => { if (!document.hidden) invalidate(); };
    controls.addEventListener("change", change); controls.addEventListener("start", start); controls.addEventListener("end", end);
    document.addEventListener("visibilitychange", visible);
    cameraApi.current = {
      zoom(delta) {
        const value = latest.current;
        if (value.state.isAnimating || value.suspended || dragging.current || transition.current) return;
        zoomTween.current?.kill();
        const distance = camera.position.distanceTo(controls.target);
        zoom.current.distance = distance;
        zoomDestination.current = clampZoom(zoomDestination.current ?? distance, delta, controls.minDistance, controls.maxDistance);
        offset.copy(camera.position).sub(controls.target).normalize();
        zoomTween.current = gsap.to(zoom.current, { distance: zoomDestination.current, duration: value.reduced ? 0 : .22, ease: "power2.out",
          onUpdate: () => { camera.position.copy(controls.target).addScaledVector(offset, zoom.current.distance); controls.update(); invalidate(); },
          onComplete: () => { zoomDestination.current = null; snapshot(); },
        });
        value.onInteraction(); invalidate();
      },
      orbit(deltaX, deltaY = 0) {
        const value = latest.current;
        if (value.state.isAnimating || value.suspended || transition.current || dragging.current) return;
        const height = Math.max(1, viewportRef.current?.clientHeight || 800);
        controls.rotateLeft(Math.PI * 2 * deltaX / height * .42);
        controls.rotateUp(Math.PI * 2 * deltaY / height * .12);
        controls.update(); value.onInteraction(); invalidate();
      },
      cancelMotion() { zoomTween.current?.kill(); zoomDestination.current = null; },
    };
    return () => {
      clearTimeout(snapshotTimer.current); zoomTween.current?.kill();
      controls.removeEventListener("change", change); controls.removeEventListener("start", start); controls.removeEventListener("end", end);
      document.removeEventListener("visibilitychange", visible);
      controls.disconnect(); cameraApi.current = null;
    };
  }, [camera, controls, viewportRef, cameraApi, invalidate, offset, snapshot]);

  useEffect(() => {
    const frame = getOrbitFrame(graph, state.currentNode, size.width, size.height, compact, panelExpanded);
    const key = [size.width, size.height, compact, panelExpanded, reduced].join(":");
    const previous = framing.current;
    framing.current = { key, node: state.currentNode };
    if (previous && previous.key !== key && previous.node === state.currentNode) {
      latest.current.onRecenter();
      return;
    }
    controls.enabled = false; dragging.current = false;
    zoomTween.current?.kill(); zoomDestination.current = null;
    // Drain any residual damping before taking ownership of the camera.
    controls.enableDamping = false; controls.update();
    if (!initialized.current || !camera.position.toArray().every(Number.isFinite)) {
      camera.position.fromArray(frame.position); controls.target.fromArray(frame.target);
      camera.setViewOffset(size.width, size.height, frame.offsetX, frame.offsetY, size.width, size.height);
      initialized.current = true;
    }
    Object.assign(pose.current, { x: camera.position.x, y: camera.position.y, z: camera.position.z,
      tx: controls.target.x, ty: controls.target.y, tz: controls.target.z, ox: camera.view?.offsetX || 0, oy: camera.view?.offsetY || 0 });
    const applyPose = () => {
      const p = pose.current;
      camera.position.set(p.x, p.y, p.z); controls.target.set(p.tx, p.ty, p.tz);
      camera.up.set(0, 1, 0); camera.lookAt(controls.target);
      camera.setViewOffset(size.width, size.height, p.ox, p.oy, size.width, size.height);
      camera.updateMatrixWorld(); invalidate();
    };
    onCameraStarted(state.revision);
    const tween = gsap.to(pose.current, {
      x: frame.position[0], y: frame.position[1], z: frame.position[2],
      tx: frame.target[0], ty: frame.target[1], tz: frame.target[2], ox: frame.offsetX, oy: frame.offsetY,
      duration: reduced ? 0 : touchDevice ? .85 : 1.1, ease: "power3.inOut",
      onUpdate: applyPose,
      onComplete: () => {
        controls.cursor.fromArray(frame.target);
        configureOrbit(controls, frame.distance, touchDevice, reduced);
        setOrbitGestureMode(controls, true);
        applyPose(); controls.update(); transition.current = null;
        snapshot(); onCameraSettled(state.revision);
      },
    });
    // Zero-duration tweens complete synchronously.
    transition.current = reduced ? null : tween;
    invalidate();
    return () => { tween.kill(); transition.current = null; };
  }, [camera, controls, graph, state.currentNode, state.revision, size.width, size.height, compact, panelExpanded, touchDevice, reduced, invalidate, onCameraStarted, onCameraSettled, snapshot]);

  useFrame((_, delta) => {
    const value = latest.current;
    controls.enabled = initialized.current && !value.state.isAnimating && !value.suspended && !transition.current;
    setOrbitGestureMode(controls, true);
    if (!transition.current && !value.state.isAnimating) {
      controls.enableDamping = !value.reduced;
      controls.dampingFactor = 1 - Math.exp(-Math.min(delta, .05) * 7);
      if (controls.update(delta)) invalidate();
    }
    camera.updateMatrixWorld();
    safetyClock.current += Math.min(delta, .25);
    if (safetyClock.current > .6 && controls.enabled && !dragging.current) {
      safetyClock.current = 0;
      projected.fromArray(graph.nodes[value.state.currentNode].position).project(camera);
      if (![projected.x, projected.y, projected.z].every(Number.isFinite) || Math.abs(projected.x) > .97 || Math.abs(projected.y) > .96 || projected.z < -1 || projected.z > 1) value.onRecenter();
    }
  }, -2);
}
