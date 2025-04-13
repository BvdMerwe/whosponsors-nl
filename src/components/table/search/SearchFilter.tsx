"use client";

import type { ReactElement } from "react";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchFilterProps {
    searchStringInitial?: string;
}

export default function SearchFilter({ searchStringInitial }: SearchFilterProps): ReactElement {
    const [searchString, setSearchString] = useState<string>(searchStringInitial ?? "");

    return (
        <>
            <Input
                type="text"
                placeholder="Search by company name"
                className="w-full"
                value={searchString}
                onChange={(event) => setSearchString(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        handleSearchStringUpdate(searchString);
                    }
                }}
            />
            {searchString === "" ||
                <i className="fa fa-x fa-xs -ml-[27px] mr-[16px] cursor-pointer" onClick={() => handleSearchStringUpdate("")}></i>}
            <Button type="submit" onClick={() => handleSearchStringUpdate(searchString)}>Search</Button>
        </>
    );
}

function handleSearchStringUpdate(searchString?: string): void {
    const params = new URLSearchParams(window.location.search);

    if (searchString === "" || typeof searchString === "undefined") {
        params.delete("tradeName");
    } else {
        params.set("tradeName", searchString);
    }

    window.location.search = params.toString();
}
