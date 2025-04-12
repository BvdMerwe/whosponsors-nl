import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const MATCHER: RegExp = /\/cron\/[\w-]+/gu;

export default function handle(request: NextRequest): NextResponse {
    if (request.nextUrl.pathname.match(MATCHER)?.length === 0) {
        return NextResponse.next();
    }

    const headerAuth = request.headers.get("Authorization");

    if (headerAuth?.split("Bearer ")[1] === process.env.NEXT_CRON_KEY) {
        return NextResponse.next();
    } else {
        return NextResponse.json("Unauthorized.", { status: 401 });
    }
}
