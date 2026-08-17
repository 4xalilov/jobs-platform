import { ScreenLoading } from "@/components/app/screen-loading";

/* Profil: yuqorida kartochka, ostida sozlama qatorlari — ikkisi ham
   avatar + ikki qatorli geometriya, shuning uchun "list" shakli */
export default function Loading() {
  return <ScreenLoading screen="profile" shape="list" rows={5} />;
}
