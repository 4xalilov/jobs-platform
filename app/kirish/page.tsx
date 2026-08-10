import { redirect } from "next/navigation";
import { LoginScreen } from "@/components/auth/login-screen";
import { isDevLoginAllowed, isTelegramConfigured } from "@/lib/auth/telegram";
import { currentUser } from "@/lib/db/session";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ xato?: string }>;
}) {
  const user = await currentUser();
  if (user) redirect("/jobs");

  const { xato } = await searchParams;

  return (
    <LoginScreen
      botUsername={process.env.TELEGRAM_BOT_USERNAME ?? null}
      configured={isTelegramConfigured()}
      devLoginAllowed={isDevLoginAllowed()}
      error={xato ?? null}
    />
  );
}
