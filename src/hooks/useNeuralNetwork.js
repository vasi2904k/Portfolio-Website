"use client";
import { useCallback, useMemo, useReducer } from "react";
import { getAncestors, getVisibleIds, initialNetworkState, networkReducer } from "@/utils/graphModel.mjs";

export default function useNeuralNetwork(graph) {
  const [state, dispatch] = useReducer((value, action) => networkReducer(graph, value, action), graph, initialNetworkState);
  const select = useCallback((id) => dispatch({ type: "SELECT", id }), []);
  const step = useCallback((direction) => dispatch({ type: "STEP", direction }), []);
  const back = useCallback(() => dispatch({ type: "BACK" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const visibleIds = useMemo(() => getVisibleIds(graph, state.expanded), [graph, state.expanded]);
  const ancestors = useMemo(() => getAncestors(graph, state.selectedId), [graph, state.selectedId]);
  return { state, select, step, back, reset, visibleIds, ancestors };
}
