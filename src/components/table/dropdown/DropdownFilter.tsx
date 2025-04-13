"use client";

import type { ReactElement } from "react";
import * as React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DropdownFilterProps {
    allFilter: {
        value: string;
        key: number;
    }[];
    filterSelected: number[];
}

export function DropdownFilter({ allFilter, filterSelected }: DropdownFilterProps): ReactElement {
    const [selected] = useState<number[]>(filterSelected);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Filter by industry</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel className="flex justify-between items-center">
                    Industries
                    {selected.length > 0 && (
                        <i
                            onClick={() => handleClearAll()}
                            className="fa fa-x cursor-pointer fa-xs"
                        />
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allFilter.map((filter) => (
                    <DropdownMenuCheckboxItem
                        checked={selected.some((key) => key === filter.key)}
                        onCheckedChange={() => handleCheckedChange(filter.key)}
                        key={filter.key}
                    >
                        {filter.value}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function handleCheckedChange(key: number): void {
    const urlParams = new URLSearchParams(window.location.search);
    const keyString = key.toString();

    if (urlParams.getAll("industry").includes(keyString)) {
        urlParams.delete("industry", keyString);
    } else {
        urlParams.append("industry", keyString);
    }

    window.location.search = urlParams.toString();
}

function handleClearAll(): void {
    const urlParams = new URLSearchParams(window.location.search);

    urlParams.delete("industry");

    window.location.search = urlParams.toString();
}
