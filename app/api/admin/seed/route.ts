import { NextResponse } from "next/server";
import { seedMockData } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await seedMockData();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown seed error.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}