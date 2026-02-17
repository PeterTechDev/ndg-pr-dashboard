import { auth as middleware } from "@/lib/auth";
export { middleware };

export const config = {
  matcher: ["/((?!_next|favicon\\.ico|og\\.png|api/auth).*)"],
};
