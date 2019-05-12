/**
 * HTTP Paging Object.
 *
 * @author Joshua Samuels <jsamue04@uoguelph.ca>
 * @module models/responses/pagingObject
 */
"use strict";

/**
 * PagingObject is the object that should contain the body of a successful response from the API if a list of items should be returned
 *
 * See the documentation at /docs/response_objects.md
 *
 * @property {string} href  - The URL to get this result set
 * @property {object} items - The array of objects that this is wrapping
 * @property {number} limit  - The maximum number of results that can be in the array
 * @property {number} offset - 0 based offset into the results that this is a list of
 * @property {number} total  - the total number of results
 * @property {string} next - The URL to get the next page of results, null if there is none
 * @property {string} previous  - The URL to get the previous page of results, null if there is none
 */
class PagingObject {
    /**
     * PagingObject constructor. Creates a new Paging Object with default values.
     * To add properties to a PagingObject you must use set methods
     * following the buider pattern
     * e.g. pagingObject = new PagingObject().href("url").limit(5).next(null);
     */

    constructor() {
        this._model = {
            items: [],
        };
    }

    get href() {
        return this._model.href;
    }

    get items() {
        return this._model.items;
    }

    get limit() {
        return this._model.limit;
    }

    get offset() {
        return this._model.offset;
    }

    get total() {
        return this._model.total;
    }

    get next() {
        return this._model.next;
    }

    get previous() {
        return this._model.previous;
    }

    setHref(href) {
        this._model.href = href;

        return this;
    }

    setItems(items) {
        this._model.items = items;

        return this;
    }

    setLimit(limit) {
        this._model.limit = Number(limit);

        return this;
    }

    setOffset(offset) {
        this._model.offset = Number(offset);

        return this;
    }

    setTotal(total) {
        this._model.total = Number(total);

        return this;
    }

    setNext(next) {
        this._model.next = next;

        return this;
    }

    setPrevious(previous) {
        this._model.previous = previous;

        return this;
    }

    addItems(...items) {
        items.forEach((item) => {
            this._model.items.push(item);
        });


        return this;
    }

    toJSON() {
        return {
            href: this._model.href,
            items: this._model.items,
            limit: this._model.limit,
            offset: this._model.offset,
            total: this._model.total,
            next: this._model.next,
            previous: this._model.previous,
        };
    }

    /**
     * getBaseUrl(req) is a static method to get the baseUrl of the request.
     * @param {object} req - the requestfor the api
     * @return {string}
     */
    static getBaseUrl(req) {
        return req.protocol + "://" + req.headers.host + req.path;
    }

    /**
     * getCurrentUrl(req) is a static method to get the url of the request
     * with any query parameters that were supplied.
     * @param {object} req - the requestfor the api
     * @return {string}
     */
    static getCurrentUrl(req) {
        return PagingObject.getBaseUrl(req) + PagingObject.addQueryParams(req.query);
    }

    /**
     * getPreviousUrl(req, offset, limit) is a static method to get the url
     * of the previous paginated page with any query
     * parameters that were supplied.
     * @param {object} req - the requestfor the api
     * @param {number} offset - the number of items to skip
     * from the result set
     * @param {number} limit - the maximum number of items
     * to return in the result set
     * @return {string}
     */
    static getPreviousUrl(req, offset, limit) {
        let baseUrl = PagingObject.getBaseUrl(req);

        if (offset > 0) {
            let newOffset = Math.max(offset - limit, 0);
            return baseUrl + PagingObject.addQueryParams(req.query,
                {
                    offset: newOffset,
                });
        }

        return null;
    }

    /**
     * getNextUrl(req, offset, limit, total) is a static method to get the url
     * of the next paginated page with any query
     * parameters that were supplied.
     * @param {object} req - the requestfor the api
     * @param {number} offset - the number of items to skip
     * from the result set
     * @param {number} limit - the maximum number of items
     * to return in the result set
     * @param {number} total - the total number of items returned from the query
     * @return {string}
     */
    static getNextUrl(req, offset, limit, total) {
        let baseUrl = PagingObject.getBaseUrl(req);

        if ((offset + limit) < total) {
            let newOffset = Math.min(offset + limit, total - 1);

            return baseUrl + PagingObject.addQueryParams(req.query,
                {
                    offset: newOffset,
                });
        }

        return null;
    }

    /**
     * addQueryParams(query, overrides) is a static method to
     * flatten request query parameters into a string
     * @param {object} query - the query parameters passed into the request
     * @param {object} overrides - the fields that should have
     * a new value for a query parameter. Ex. to override offset
     * url += addQueryParams(req, { offset: 12 });
     * @return {string}
     */
    static addQueryParams(query, overrides) {
        let temp = {};
        let queryParams = "?";

        // add the overides
        if (overrides) {
            Object.entries(overrides).forEach(([
                key,
                value
            ]) => {
                temp[key] = value;
            });
        }

        // add the rest of the query params
        if (query) {
            Object.entries(query).forEach(([
                key,
                value
            ]) => {
                queryParams += `${key}=`;
                if (temp && temp.hasOwnProperty(key)) {
                    queryParams += `${temp[key]}&`;
                    delete temp[key];
                } else {
                    queryParams += `${value}&`;
                }
            });
        }

        if (temp) {
            Object.entries(temp).forEach(([
                key,
                value
            ]) => {
                queryParams += `${key}=${value}&`;
            });
        }

        return queryParams.substring(0, queryParams.length -1);
    }
}

module.exports = {
    PagingObject,
};
