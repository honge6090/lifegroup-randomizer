import { headers } from "next/headers";
import QRCode from "qrcode";
import AdminConsole from "@/components/AdminConsole";
import { listMembers } from "@/lib/members";

// The roster changes constantly during sign-ups, so always read it fresh.
export const dynamic = "force-dynamic";

/**
 * Work out the public URL of this deployment from the incoming request, so the
 * QR code points at wherever the app is actually running. That means it works
 * on localhost during testing and on the real domain in production without
 * anything hardcoded.
 */
async function getOrigin(): Promise<string> {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ??
    headerList.get("host") ??
    "localhost:3000";
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export default async function AdminPage() {
  const [members, origin] = await Promise.all([listMembers(), getOrigin()]);
  const signupUrl = `${origin}/`;

  const qrDataUrl = await QRCode.toDataURL(signupUrl, {
    width: 720,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#211d18", light: "#ffffff" },
  });

  return (
    <AdminConsole
      members={members}
      signupUrl={signupUrl}
      qrDataUrl={qrDataUrl}
    />
  );
}
