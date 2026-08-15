"use client";

import { Button } from "@/components/ui/button";

/**
 * Kutilmagan xatolik ekrani.
 * Ishlab chiqarishda Next xabar matnini yashiradi, shuning uchun bu yerda
 * faqat umumiy izoh va qayta urinish tugmasi bo'ladi.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[27.5rem] flex-col items-center justify-center gap-4 bg-bg px-8 text-center">
      <h1 className="text-nav text-fg">Nimadir noto&apos;g&apos;ri ketdi</h1>
      <p className="text-body text-fg-secondary">
        Baza ulanmagan bo&apos;lishi mumkin. README&apos;dagi &laquo;Bazani ko&apos;tarish&raquo;
        bo&apos;limiga qarang.
      </p>
      <Button onClick={reset}>Qayta urinish</Button>
    </div>
  );
}
