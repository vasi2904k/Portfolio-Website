"use client";
import { useCallback, useEffect, useRef } from "react";
import { classifyTouch } from "@/utils/navigationInput.mjs";

// The DOM and Three.js hit areas share pointer-up activation. OrbitControls
// captures pointers, so relying on a subsequent browser click loses label taps.
export default function useSceneGestures(options) {
  const latest = useRef(options); latest.current = options;
  const pointers = useRef(new Set()), gesture = useRef(null), pending = useRef(null), timer = useRef();
  const cancel = useCallback(() => {
    pointers.current.clear(); gesture.current = null; pending.current = null; clearTimeout(timer.current);
  }, []);
  useEffect(() => cancel, [cancel]);
  const activate = useCallback((id, keyboard = false) => {
    const value = latest.current;
    if (value.locked || value.suspended) return;
    value.onInteraction();
    clearTimeout(timer.current);
    if (keyboard) { pending.current = null; value.onActivate(id, true); return; }
    const now = performance.now();
    if (pending.current?.id === id && now - pending.current.time < 320) {
      pending.current = null; value.onFocusNode(id); return;
    }
    pending.current = { id, time: now };
    value.onPreview(id);
    timer.current = setTimeout(() => { pending.current = null; latest.current.onActivate(id); }, 320);
  }, []);
  const pressNode = useCallback((id, pointerId) => {
    if (gesture.current?.id === pointerId && !gesture.current.multiple) gesture.current.node = id;
  }, []);
  const down = useCallback(event => {
    const value = latest.current;
    if (value.locked || value.suspended) return;
    if (event.pointerType === "touch") value.onTouch?.();
    pointers.current.add(event.pointerId);
    if (gesture.current) { gesture.current.multiple = true; clearTimeout(timer.current); pending.current = null; return; }
    gesture.current = { id: event.pointerId, node: event.target.closest?.("[data-neural-id]")?.dataset.neuralId,
      x: event.clientX, y: event.clientY, time: performance.now(), maxDistance: 0,
      lastX: event.clientX, lastY: event.clientY, axis: null,
      multiple: false, button: event.button, type: event.pointerType, hinted: false };
  }, []);
  const move = useCallback(event => {
    const record = gesture.current;
    if (!record || !pointers.current.has(event.pointerId)) {
      if (event.pointerType === "mouse" && !event.buttons) latest.current.onPointerMove?.(event.clientX, event.clientY);
      return;
    }
    const dx = event.clientX - record.x, dy = event.clientY - record.y;
    record.maxDistance = Math.max(record.maxDistance, Math.hypot(dx, dy));
    if (record.maxDistance > 10) {
      clearTimeout(timer.current); pending.current = null;
      if (!record.hinted) { latest.current.onInteraction(); record.hinted = true; }
    }
    if (record.type === "touch" && !record.multiple && record.maxDistance > 12) {
      if (!record.axis) {
        if (Math.abs(dx) > Math.abs(dy) * 1.25) record.axis = "orbit";
        else if (Math.abs(dy) > Math.abs(dx) * 1.25) record.axis = "navigate";
      }
      if (record.axis === "orbit") latest.current.onOrbit?.(event.clientX - record.lastX, event.clientY - record.lastY);
    }
    record.lastX = event.clientX; record.lastY = event.clientY;
  }, []);
  const up = useCallback(event => {
    const record = gesture.current;
    pointers.current.delete(event.pointerId);
    if (!record || pointers.current.size) return;
    gesture.current = null;
    const dx = event.clientX - record.x, dy = event.clientY - record.y;
    const kind = classifyTouch(dx, dy, performance.now() - record.time, Math.max(record.maxDistance, Math.hypot(dx, dy)), record.multiple);
    const value = latest.current;
    if (value.locked || value.suspended || record.button > 0) return;
    if (kind === "tap" && record.node) activate(record.node);
    // On touch, vertical swipes always navigate (no mode toggle needed).
    else if (record.type === "touch" && (kind === "forward" || kind === "back")) {
      if (kind === "forward" && record.node && record.node !== value.currentNode) {
        value.onInteraction();
        value.onActivate(record.node);
      } else value.onTravel(kind === "forward" ? 1 : -1);
    }
  }, [activate]);
  const click = useCallback(event => {
    if (event.detail > 0 || latest.current.locked || latest.current.suspended) { event.preventDefault(); event.stopPropagation(); }
  }, []);
  return { activate, pressNode, cancel, handlers: { onPointerDownCapture: down, onPointerMoveCapture: move, onPointerUpCapture: up, onPointerCancelCapture: cancel, onClickCapture: click } };
}
