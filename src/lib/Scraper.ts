/* eslint-disable no-unused-vars */
import { JSDOM } from "jsdom";

interface ScraperOptionType {
    url: URL;
    paginationType?: PaginationTypeEnum;
    paginationIdentifier?: string;
    classNamePageNext?: string;
    classNamePageNextDisqualifier?: string;
    pageNumber?: number;
}

interface PaginatorType {
    paginationType: PaginationTypeEnum;
    identifier: string;
    number: number;
}

enum PaginationTypeEnum {
    QUERY_PARAM,
    PATH_SEGMENT,
}

enum PaginationDirectionEnum {
    BACK = -1,
    FORWARD = 1,
}

export default class Scraper {
    public url: URL;
    public pageNumber: number;
    public domCurrent?: Document;
    private classNamePageNext: string;
    private classNamePageNextDisqualifier: string;
    private paginator: PaginatorType;

    constructor({
        url,
        classNamePageNext,
        classNamePageNextDisqualifier,
        pageNumber,
        paginationType,
        paginationIdentifier,
    }: ScraperOptionType) {
        this.url = url;
        this.classNamePageNext = classNamePageNext ?? "";
        this.classNamePageNextDisqualifier = classNamePageNextDisqualifier ?? "";
        this.pageNumber = pageNumber ?? 1;
        this.paginator = {
            identifier: paginationIdentifier ?? "",
            paginationType: paginationType ?? PaginationTypeEnum.QUERY_PARAM,
            number: this.pageNumber ?? 0,
        };
    }

    public async start(): Promise<Document[]> {
        const allPage: Document[] = [];
        let domPage = await this.fetchDom();

        allPage.push(domPage);

        if (this.classNamePageNext !== "") {
            while (domPage.querySelector(this.classNamePageNext + `:not(${this.classNamePageNextDisqualifier})`)) {
                domPage = await this.paginate(PaginationDirectionEnum.FORWARD);

                allPage.push(domPage);
            }
        }

        return allPage;
    }

    public async fetchDom(): Promise<Document> {
        const res = await fetch(this.url);
        const html = await res.text();

        this.domCurrent = (new JSDOM(html)).window.document;

        return this.assertDomCurrent();
    }

    private assertDomCurrent(): Document {
        if (this.domCurrent === null || typeof this.domCurrent === "undefined") {
            throw "DOM is null.";
        } else {
            return this.domCurrent;
        }
    }

    public async paginate(
        direction: PaginationDirectionEnum,
    ): Promise<Document> {
        if (this.paginator === undefined) {
            throw "Paginator is undefined.";
        }

        switch (direction) {
        case PaginationDirectionEnum.FORWARD:
            this.handlePaginationForward();
            break;
        case PaginationDirectionEnum.BACK:
            this.handlePaginationBackward();
            break;
        default:
            throw "Nope!";
        }

        return this.fetchDom();
    }

    private handlePaginationForward(): void {
        this.paginator.number += 1;
        this.updateUrl();
    }

    private handlePaginationBackward(): void {
        this.paginator.number -= 1;
        this.updateUrl();
    }

    private updateUrl(): void {
        if (
            this.paginator.paginationType ===
            PaginationTypeEnum.PATH_SEGMENT
        ) {
            this.updatePaginatorPathSegment();
        } else if (
            this.paginator.paginationType ===
            PaginationTypeEnum.QUERY_PARAM
        ) {
            this.updatePaginatorQueryParameter();
        } else {
            throw "Pagination type doesn't exist";
        }
    }

    private updatePaginatorPathSegment(): void {
        const allPartUrl = this.url.pathname.split(this.paginator.identifier);

        allPartUrl[1] = this.paginator.number.toString();

        this.url.pathname = allPartUrl.join(
            this.paginator.identifier + "/",
        );
    }

    private updatePaginatorQueryParameter(): void {
        this.url.searchParams.set(
            this.paginator.identifier,
            this.paginator.number.toString(),
        );
    }
}

export { PaginationDirectionEnum, PaginationTypeEnum };

export type { PaginatorType, ScraperOptionType };
