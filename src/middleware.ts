import type { NextRequest, NextResponse } from "next/server";
import middlewareCron from "@/middleware/cron-middleware";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest): NextResponse {
    return middlewareCron(request);
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ["/api/cron/:cron*"],
};
