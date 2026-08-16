"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { IconCheck } from "@/components/ui/icon";
import { ListGroup, ListItem, SectionHeader } from "@/components/ui/list";
import { Sheet } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { usePush } from "@/lib/use-push";
import { useSheet } from "@/lib/use-sheet";
import shared from "@/styles/shared.module.scss";
import styles from "./profile.module.scss";

/** Kuniga bitta xabar keladi, shuning uchun tanlov ham kunlik vaqtlar */
const HOURS = [7, 8, 9, 12, 18, 20];

/**
 * Bildirishnoma sozlamalari (v4, §1.5).
 *
 * Bu yerda faqat ikkita boshqaruv bor: yoqish va vaqt. Kanal
 * darajasidagi ovozsiz qilish Ishlar ro'yxatida — bir narsa ikki
 * joyda boshqarilsa foydalanuvchi qaysi biri kuchli ekanini bilmaydi.
 */
export function PushSettings() {
  const { t } = useI18n();
  const push = usePush(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null);
  const hourSheet = useSheet<true>();

  // Server VAPID siz ishlayotgan bo'lsa bo'limni umuman ko'rsatmaymiz
  if (!push.available && !push.blocked) return null;

  const label = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

  return (
    <>
      <SectionHeader>{t.push.label}</SectionHeader>
      <ListGroup>
        {/* Ikonkasiz — "Xabar vaqti" qatorida ikonka yo'q va ikkalasi
            bir chiziqdan boshlanishi kerak */}
        <ListItem
          title={<span className={shared.rowTitle}>{t.push.label}</span>}
          subtitle={push.blocked ? t.push.blocked : push.enabled ? t.push.on : t.push.off}
          wrapSubtitle
          insetSeparator={false}
          last={!push.enabled}
          trailing={
            <Switch
              checked={push.enabled}
              onCheckedChange={(next) => {
                if (push.blocked || push.busy) return;
                void (next ? push.enable() : push.disable());
              }}
              label={t.push.label}
            />
          }
        />
        {push.enabled && (
          <ListItem
            title={<span className={shared.rowTitle}>{t.push.hour}</span>}
            insetSeparator={false}
            trailing={<span className={shared.rowValue}>{label(push.hour)}</span>}
            chevron
            last
            onClick={() => hourSheet.open(true)}
          />
        )}
      </ListGroup>

      <p className={shared.hint}>
        {push.blocked ? t.push.blockedHint : push.enabled ? t.push.mutedNote : t.push.hint}
      </p>

      <Sheet
        open={hourSheet.isOpen}
        onClose={hourSheet.close}
        closeLabel={t.common.close}
        title={t.push.hour}
      >
        <ListGroup>
          {HOURS.map((hour, i) => (
            <ListItem
              key={hour}
              title={<span className={shared.rowTitle}>{label(hour)}</span>}
              insetSeparator={false}
              last={i === HOURS.length - 1}
              trailing={
                push.hour === hour ? (
                  <IconCheck size={20} className={shared.accentIcon} />
                ) : undefined
              }
              onClick={() => {
                void push.setHour(hour);
                hourSheet.close();
              }}
            />
          ))}
        </ListGroup>
        <p className={styles.sheetHint}>{t.push.hourHint}</p>
        <div className={styles.sheetTail} />
      </Sheet>
    </>
  );
}
