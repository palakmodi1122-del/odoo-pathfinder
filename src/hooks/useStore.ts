"use client";

import { useEffect, useState } from "react";
import { getStore } from "@/lib/store";

export function useStore() {
  const store = getStore();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return store.subscribe(() => forceUpdate(n => n + 1));
  }, [store]);

  return store;
}
