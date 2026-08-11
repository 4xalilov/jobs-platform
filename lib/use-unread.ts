"use client";

import { useCallback, useState } from "react";
import { apiGet } from "@/lib/api";
import { usePolling } from "@/lib/use-polling";

/**
 * Tab bardagi o'qilmagan belgisi.
 * Boshlang'ich qiymat serverdan keladi — belgi birinchi so'rovni kutmaydi.
 */
export function useUnread(initial: number): number {
  const [count, setCount] = useState(initial);

  const refresh = useCallback(async () => {
    const { count: fresh } = await apiGet<{ count: number }>("/unread");
    setCount(fresh);
  }, []);

  usePolling(refresh, 5000);
  return count;
}
