import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "./firebase-admin";

type AuthResult =
  | { authorized: true; uid: string }
  | { authorized: false; response: NextResponse };

/**
 * Verify that the request comes from an authenticated admin user.
 * Checks Firebase ID token + Firestore user document role.
 */
export async function verifyAdmin(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Missing auth token" },
        { status: 401 }
      ),
    };
  }

  try {
    const token = authHeader.split("Bearer ")[1];
    const decoded = await getAdminAuth().verifyIdToken(token);
    const userDoc = await getAdminDb().collection("users").doc(decoded.uid).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== "admin") {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        ),
      };
    }

    return { authorized: true, uid: decoded.uid };
  } catch {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 }
      ),
    };
  }
}
