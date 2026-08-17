import { ScreenLoading } from "@/components/app/screen-loading";

/** Kanal ichi — sarlavha kanal nomi, u hali ma'lum emas */
export default function Loading() {
  return <ScreenLoading shape="vacancy" rows={5} back="/jobs" />;
}
