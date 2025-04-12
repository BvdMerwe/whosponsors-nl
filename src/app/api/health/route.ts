import { NextResponse } from "next/server";

export default async function GET(): Promise<NextResponse> {
    return NextResponse.json({ status: "healthy" });
}
