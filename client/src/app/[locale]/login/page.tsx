import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

// /login has no form of its own — /register handles both sign-up and sign-in.
// skip_role=1 lands on the sign-in form instead of the role picker.
export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  redirect({ href: "/register?skip_role=1", locale });
}
