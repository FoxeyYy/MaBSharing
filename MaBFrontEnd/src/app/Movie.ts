import { Resource } from "./Resource";

export class Movie extends Resource {
    director: string;
}

export function isMovie(obj:any):obj is Movie {
    return obj.director !== undefined;
}