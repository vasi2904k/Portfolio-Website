"use client";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { getAvailableIds, getNextNode, getVisibleIds, initialNetworkState, networkReducer } from "@/utils/graphModel.mjs";

export default function useNeuralNetwork(graph) {
  const [state, dispatch] = useReducer((value, action) => networkReducer(graph, value, action), graph, initialNetworkState);
  const graphSignature = graph.order.join("|");
  useEffect(() => { dispatch({ type: "SYNC_GRAPH" }); }, [graphSignature]);
  const select = useCallback((id) => dispatch({ type: "SELECT", id }), []);
  const step = useCallback((direction) => dispatch({ type: "STEP", direction }), []);
  const back = useCallback(() => dispatch({ type: "BACK" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const recenter = useCallback(() => dispatch({ type: "RECENTER" }), []);
  const hover = useCallback(id => dispatch({ type: "HOVER", id }), []);
  const focus = useCallback(id => dispatch({ type: "FOCUS", id }), []);
  const cameraStarted = useCallback(revision => dispatch({ type: "CAMERA_STARTED", revision }), []);
  const cameraSettled = useCallback(revision => dispatch({ type: "CAMERA_SETTLED", revision }), []);
  const reveal = useCallback((id, revision) => dispatch({ type: "REVEAL", id, revision }), []);
  const cameraPose = useCallback((position, target, revision) => dispatch({ type: "CAMERA_POSE", position, target, revision }), []);
  const visibleIds = useMemo(() => getVisibleIds(graph, state.expandedNodes), [graph, state.expandedNodes]);
  const readyIds = useMemo(() => new Set(state.readyNodes), [state.readyNodes]);
  const availableIds = useMemo(() => getAvailableIds(graph, state), [graph, state]);
  return { state, select, step, back, reset, recenter, hover, focus, cameraStarted, cameraSettled, cameraPose, reveal, visibleIds, readyIds, availableIds, nextNode: getNextNode(graph, state) };
}
