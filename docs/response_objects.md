# This document decides the response payload objects

- [Paging Object](#paging-object)
- [Generic Response Object](#generic-response-object)
- [Exec Object](#exec-object)
- [Roboticon Challenge Object](#roboticon-challenge-object)
- [Event Object](#event-object)
- [Product Object](#product-object)

## Timestamps
Timestamps are returned in [RFC3339](https://www.ietf.org/rfc/rfc3339.txt) format as Coordinated Universal Time (UTC) with a zero offset: `YYYY-MM-DDTHH:MM:SS.SSSZ`.

## Paging Object

Sometimes there are multiple results that need to be returned, when that is the case they are wrapped in this object.

| Field | Type | Description |
| ----- | ----- | --------- |
| href | String | The URL to get this result set. |
| items | [Object] | The array of objects that this is wrapping. |
| limit | integer | The maximum number of results that can be in the array, this is a positive integer |
| offset | integer | 0 based offset into the results that this is a list of. |
| total | integer | the total number of results. |
| next | String | The URL to get the next page of results, null if there is none. |
| previous | String | The URL to get the previous page of results, null if there is none. |


### Example Paging Object
```json
{
    "href": "link that will return same result",
    "items": [],
    "limit": 20,
    "offset": 0,
    "total": 100,
    "next": "null if none",
    "previous": "null if none"
}
```


## Generic Response Object


| Field | Type | Description |
| ----- | ---- | ----------- |
| status | Integer | The HTTP status code also returned in the response |
| message | String | Human readable error message |


## Example Error Object

```json
{
    "status": 400,
    "message": "The post ID already exists"
}
```


## Exec Object


| Field | Type | Description |
| ----- | ---- | ----------- |
| id | String | This is a 24 character hex string that uniquely identifies the exec item |
| name | String | The name of the executive |
| email | String | The email address that is associated with this exec |
| role | String | This is the name of the executives role |
| order | Integer | This is a integer that is used to determine the order that they appear in the response lists |
| year | Integer | This is the 4 digit year of the first year of the school year of the execs term, (ie. for the 2019-2020 school year the value would be 2019)|

## Example exec Object

```json
{
    "id": "507f1f77bcf86cd799439011",
    "name": "Marshall Asch",
    "email": "admin@socis.ca",
    "role": "System Administrator",
    "order": 5,
    "year": 2019
}
```


## Roboticon Challenge Object


| Field | Type | Description |
| ----- | ---- | ----------- |
| id | String | This is a 24 character hex string that uniquely identifies the challenge item |
| year | Integer | This is the 4 digit year of the roboticon event |
| challenge_number | Integer | This is a positive number, most likely either a 1 or 2, but it could be larger. |
| description | String | The is the description string of the challenge, it will be [github flavored markdown](https://github.github.com/gfm/)  |
| goal | String | This should be a markdown list of challenge objectives |
| parameters | String | This is the markdown list of challenge specifications |
| points | String | This is a markdown list explaining how to get or loose points for the challenge  |
| hidden | Boolean | This is a true false value if the challenge is supposed to be visible to users yet or not |
| image | String | In response with will be a URL to the location of the image, in the request this will be a base64 encoded string. This is the challenge image that will appear along with the description |
| map | String | In response with will be a URL to the location of the image, in the request this will be a base64 encoded string. This will be an example map for the challenge |

## Example Challenge Object

```json
{
    "id": "507f1f77bcf86cd799439011",
    "year": 2019,
    "challenge_number": 1,
    "hidden": false,
    "description": "This is a bit of information about the first challenge.",
    "goal": "- To drive the robot to the other side\n- To win it all!!",
    "parameters": "- Arena will be 3', by 12'\n- If the robot crosses the black border line then the run will end",
    "points": "- 2 points for making it to the end zone.\n- Every checkpoint line the robot passes will gain 1 point.",
    "image": "https://socis.ca/files/15EA71AB4F5D6308A3F810DDB5B50D75513E6857",
    "map": "https://socis.ca/files/CB0848CBC4426AA79D71709D62E0EDAB554B4E21" 
 
}
```

## Event Object


| Field | Type | Description |
| ----- | ---- | ----------- |
| id | String | This is a 24 character hex string that uniquely identifies the event item |
| start_time | String | This is a [timestamp](#timestamps) representing the start of the event |
| end_time | String | This is a [timestamp](#timestamps) representing the end of the event |
| title | String | This is the event title |
| description | String | The is the description string of the event, it will be [github flavored markdown](https://github.github.com/gfm/)  |
| tags | [String] | This is an array of strings that can be used to tag the events |
| location | String | This is the location of the event, it is a markdown string |

## Example Event Object

```json
{
    "id": "507f1f77bcf86cd799439011",
    "start_time": "2019-04-04T19:00:00.000z",
    "end_time": "2019-04-04T20:00:00.000z",
    "title": "The Last SOCIS event of the year",
    "description": "This is a bit of information about the event that will be *awesome*!",
    "location": "Reynolds 0101",
    "tags": ["awesome", "event"] 
 
}
```


## Product Object


| Field | Type | Description |
| ----- | ---- | ----------- |
| id | String | This is a 24 character hex string that uniquely identifies the product item |
| name | String | The name of the product in the store |
| type | String | This is the type of the item |
| price | Number | This is a floating point value representing the price of the product in $CAD |
| description | String | The is the description string of the product, it will be [github flavored markdown](https://github.github.com/gfm/)  |
| tags | [String] | This is an array of strings that can be used to tag the product |
| images | [String] | In response with will be a URL's to the location of the images, in the request this will be a base64 encoded strings. These are images of the products to display |
| available  | Boolean | If this is `false` then this item is not currently for sale in the store but it is visible |
| sale | Object | This object may be set if the object is on sale, either the `discount` or `percent` field must be set, or this must be `null` |
| sale.discount | Number | This is the dollar value that is off the regular price of the product |
| sale.percent | Number | This is the percent discount that is off the regular price of the item |
 
## Example Product Object

```json
{
    "id": "507f1f77bcf86cd799439011",
    "name": "Laptop Sticker",
    "type": "stickers",
    "price": 2.00,
    "description": "This is our new laptop stickers with the SOCIS logo",
    "tags": ["stickers", "products", "sale"],
    "images": [
      "https://socis.ca/files/C5704C6BF306F6B6E3422F0BA3D4AFB07160C842", 
      "https://socis.ca/files/F56D6351AA71CFF0DEBEA014D13525E42036187A", 
      "https://socis.ca/files/3D41B850CD7E17611D35E787FC97F18C30731EFE"
    ],
    "available": "true",
    "sale": null
}
```