"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Sheet holati brauzer tarixiga bog'lanadi — telefondagi "orqaga" tugmasi
 * sahifadan chiqib ketmasdan sheetni yopadi.
 */
export function useSheet<T>() {
  const [value, setValue] = useState<T | null>(null);

  // Tashqi tizim (tarix) o'zgarishiga obuna
  useEffect(() => {
    const onPopState = () => setValue(null);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const open = useCallback((next: T) => {
    setValue(next);
    window.history.pushState({ sheet: true }, "");
  }, []);

  const close = useCallback(() => {
    if (window.history.state?.sheet) {
      window.history.back(); // popstate holatni tozalaydi
    } else {
      setValue(null);
    }
  }, []);

  return { value, isOpen: value !== null, open, close };
}
