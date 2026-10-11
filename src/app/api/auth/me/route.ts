import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({
    user: user ? { name: user.name, email: user.email } : null,
  });
}
