"use client";

import { useEffect, useState } from "react";
import { getStore } from "@/lib/store";

export function useFleetStore() {
  const store = getStore();
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = store.subscribe(() => setTick(t => t + 1));
    return unsub;
  }, [store]);

  return store;
}
