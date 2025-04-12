import type { ReactElement } from "react";
import React from "react";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import type { Company, Industry } from "@/generated/prisma";
import { Prisma, PrismaClient } from "@/generated/prisma";
import { DropdownFilter } from "@/components/table/dropdown/DropdownFilter";
import { isArray } from "node:util";
import CompanyWhereInput = Prisma.CompanyWhereInput;
import SearchFilter from "@/components/table/search/SearchFilter";

const PAGE_SIZE = 50;

interface PaginationQuery {
    pageIndex: number;
    tradeName?: string;
    allIndustry?: number[];
}

interface PaginatedData {
    data: Company[];
    pageCount: number;
    allIndustry: Industry[];
}

async function getData({
    pageIndex,
    tradeName,
    allIndustry,
}: PaginationQuery): Promise<PaginatedData> {
    const prisma = new PrismaClient();
    const queryName: CompanyWhereInput[] = [];
    const queryIndustry: CompanyWhereInput[] = [];

    if (typeof tradeName === "string") {
        queryName.push({
            tradeName: {
                contains: tradeName,
                mode: "insensitive",
            },
        });
    }

    console.log(allIndustry);

    if (isArray(allIndustry)) {
        allIndustry.forEach((industry) => queryIndustry.push({
            industry: {
                id: industry,
            },
        }));
    }

    const filter: CompanyWhereInput = {
    };

    if (queryName.length > 0) {
        filter.AND = queryName;
    }

    if (queryIndustry.length > 0) {
        filter.OR = queryIndustry;
    }

    return {
        data: await prisma.company.findMany({
            take: PAGE_SIZE,
            skip: PAGE_SIZE * pageIndex,
            orderBy: {
                id: "asc",
            },
            include: {
                industry: true,
            },
            where: filter,
        }),
        pageCount: Math.round(await prisma.company.count({
            where: filter,
        }) / PAGE_SIZE),
        allIndustry: await prisma.industry.findMany(),
    };
}

export default async function Home({ searchParams }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<ReactElement> {
    const { page, tradeName, industry } = await searchParams;
    let pageParsed = parseInt(page as string);
    const allIndustrySelected = parseAllIndustrySelected(industry);

    if (isNaN(pageParsed)) {
        pageParsed = 1;
    }

    const pageIndex = Math.max(pageParsed, 1) - 1;

    const { data, pageCount, allIndustry } = await getData({
        pageIndex,
        tradeName: tradeName as string | undefined,
        allIndustry: allIndustrySelected as number[] | undefined,
    });

    return (
        <div className="container mx-auto py-10">

            <div className="mb-4 flex items-center space-x-2 w-full">
                <SearchFilter searchStringInitial={tradeName as string | undefined} />
                <DropdownFilter
                    allFilter={allIndustry.map((industry) => ({
                        value: industry.name,
                        key: industry.id,
                    }))}
                    filterSelected={allIndustrySelected ?? []}
                />
            </div>

            <DataTable columns={columns} data={data} pageIndex={pageIndex} pageCount={pageCount} />
        </div>
    );
}

function parseAllIndustrySelected(allIndustry?: string[] | string): number[] {
    if (typeof allIndustry === "string") {
        const industryParsed = parseInt(allIndustry);

        return isNaN(industryParsed) ? [] : [industryParsed];
    } else if (typeof allIndustry === "undefined") {
        return [];
    } else {
        return allIndustry
            .map((industry) => parseInt(industry))
            .filter((industry) => !isNaN(industry));
    }
}
