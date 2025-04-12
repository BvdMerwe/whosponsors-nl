"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Company } from "@/generated/prisma";
import Link from "next/link";
import type { ReactElement } from "react";

export const columns: ColumnDef<Company>[] = [
    {
        header: "Trade Name",
        accessorKey: "tradeName",
        cell: ({ row }): ReactElement => {
            const tradeName: string = row.getValue("tradeName");

            return (
                <div className="font-bold">
                    <Link href={"https://www.google.com/search?q=" + tradeName} target="_blank">
                        {tradeName}
                        {" "}
                        <i className="fa-solid fa-up-right-from-square"></i>
                    </Link>
                </div>
            );
        },
    },
    {
        header: "Industry",
        accessorKey: "industry.name",
        maxSize: 200,
        minSize: 200,
    },
];
