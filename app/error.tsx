"use client";

import { Button } from "@/components/ui/button";
import shell from "@/components/app/shell.module.scss";

/**
 * Kutilmagan xatolik ekrani.
 * Ishlab chiqarishda Next xabar matnini yashiradi, shuning uchun bu yerda
 * faqat umumiy izoh va qayta urinish tugmasi bo'ladi.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className={shell.error}>
      <h1 className={shell.errorTitle}>Nimadir noto&apos;g&apos;ri ketdi</h1>
      <p className={shell.errorHint}>
        Baza ulanmagan bo&apos;lishi mumkin. README&apos;dagi &laquo;Bazani ko&apos;tarish&raquo;
        bo&apos;limiga qarang.
      </p>
      <Button onClick={reset}>Qayta urinish</Button>
    </div>
  );
}
