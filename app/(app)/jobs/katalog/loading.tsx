import { ScreenLoading } from "@/components/app/screen-loading";

export default function Loading() {
  return <ScreenLoading screen="catalog" shape="channel" rows={8} back="/jobs" />;
}
