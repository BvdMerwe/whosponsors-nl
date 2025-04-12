"use client";

import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import {
    flexRender, getCoreRowModel, getPaginationRowModel, useReactTable,
} from "@tanstack/react-table";

import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { ReactElement } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageIndex: number;
    pageCount: number;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageIndex,
    pageCount,
}: DataTableProps<TData, TValue>): ReactElement {
    const [pagination] = useState<PaginationState>({
        pageIndex, //initial page index
        pageSize: 10, //default page size
    });

    const table = useReactTable({
        data,
        columns,
        pageCount,
        getPaginationRowModel: getPaginationRowModel(),
        rowCount: data.length,
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
        autoResetPageIndex: false,
        onPaginationChange: (updater) => {
            // @ts-expect-error - dunno.
            const { pageIndex } = updater(pagination);
            const searchParams = new URLSearchParams(window.location.search);

            searchParams.set("page", (pageIndex + 1).toString());
            window.location.search = searchParams.toString();
        },
        state: {
            pagination,
        },
    });

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}{" "}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center"> No results. </TableCell>
                            </TableRow>
                        )}
                    </TableBody>

                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.firstPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    First
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.lastPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Last
                </Button>
            </div>
        </div>
    );
}
