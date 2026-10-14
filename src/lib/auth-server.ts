import "server-only";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

export async function requireFirebaseUser(request: Request) {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer (.+)$/);
  if (!match) {
    return { user: null, response: Response.json({ error: "Sign in to continue." }, { status: 401 }) };
  }

  try {
    const user = await getFirebaseAdminAuth().verifyIdToken(match[1]);
    return { user, response: null };
  } catch (error) {
    console.error("Firebase token verification failed.", error);
    if (error instanceof Error && error.message.includes("Firebase Admin credentials are not configured")) {
      return { user: null, response: Response.json({ error: "Account services are not configured yet." }, { status: 503 }) };
    }
    return { user: null, response: Response.json({ error: "Your session expired. Sign in again." }, { status: 401 }) };
  }
}
