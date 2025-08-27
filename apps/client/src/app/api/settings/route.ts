import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "Settings endpoint is not implemented yet" },
    { status: 501 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: "Update settings is not implemented yet" },
    { status: 501 }
  );
}
