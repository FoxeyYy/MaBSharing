import { Resource } from "./Resource";

export class Book extends Resource {
    edition: number;
    writer: string;
}

export function isBook(obj:any):obj is Book {
    return obj.writer !== undefined;
}