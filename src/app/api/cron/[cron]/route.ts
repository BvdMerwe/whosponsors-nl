import type { NextRequest } from "next/server";
import updateAllSponsor from "@/scripts/update-all-sponsor";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ [key: string]: string }> },
): Promise<Response> {
    const { cron } = await params;

    switch (cron) {
    case "update-all-sponsor":
        await updateAllSponsor();
        break;
    }

    return Response.json({
        status: "success",
    }, {
        status: 200,
    });
}

