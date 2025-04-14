import type { ReactElement } from "react";
import React from "react";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import type { Company } from "@/generated/prisma";
import { Prisma, PrismaClient } from "@/generated/prisma";
import { DropdownFilter } from "@/components/table/dropdown/DropdownFilter";
import { isArray } from "node:util";
import SearchFilter from "@/components/table/search/SearchFilter";
import CompanyWhereInput = Prisma.CompanyWhereInput;

const PAGE_SIZE = 50;

interface PaginationQuery {
    pageIndex: number;
    tradeName?: string;
    allIndustry?: number[];
}

interface PaginatedData {
    data: Company[];
    pageCount: number;
    allIndustry: IndustryWithCount[];
}

interface IndustryWithCount {
    id: number;
    name: string;
    slug: string;
    _count: {
        companies: number;
    };
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

    if (isArray(allIndustry)) {
        allIndustry.forEach((industry) => queryIndustry.push({
            industries: {
                some: {
                    id: industry,
                },
            },
        }));
    }

    const filter: CompanyWhereInput = {};

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
                tradeName: "asc",
            },
            include: {
                industries: true,
            },
            where: filter,
        }),
        pageCount: Math.round(await prisma.company.count({
            where: filter,
        }) / PAGE_SIZE),
        allIndustry: await prisma.industry.findMany({
            include: {
                _count: {
                    select: {
                        companies: true,
                    },
                },
            },
        }),
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
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl mb-4 font-bold text-center">Who sponsors HSM Visas in the Netherlands?</h1>
            <p className="text-center text-balance mb-8">
                This list was pulled from the <a href="https://ind.nl/en/public-register-recognised-sponsors/public-register-regular-labour-and-highly-skilled-migrants" target="_blank">IND public register</a> and is currently being categorized by AI. If you spot mistakes, please feel free to raise an issue in <a href="https://github.com/BvdMerwe/whosponsors-nl/issues" target="_blank">GitHub</a>.
            </p>
            <div className="mb-4 flex items-center space-x-2 w-full">
                <SearchFilter searchStringInitial={tradeName as string | undefined} />
                <DropdownFilter
                    allFilter={
                        allIndustry
                            .sort((industry) => allIndustrySelected.includes(industry.id) ? -1 : 1)
                            .map((industry) => ({
                                value: industry.name,
                                key: industry.id,
                                _count: industry._count.companies,
                            }))
                    }
                    filterSelected={allIndustrySelected ?? []}
                />
            </div>

            <DataTable columns={columns} data={data} pageIndex={pageIndex} pageCount={pageCount} />

            <footer className="text-sm w-full">
                <p>Made by <a href="https://github.com/BvdMerwe">@BvdMerwe</a> over a weekend in 2025</p>
            </footer>
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
