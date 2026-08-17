import { ScreenLoading } from "@/components/app/screen-loading";

/** Kanallar ro'yxati — ikki qatorli qatorlar, o'ngda o'qilmagan soni */
export default function Loading() {
  return <ScreenLoading screen="jobs" shape="channel" rows={6} />;
}
