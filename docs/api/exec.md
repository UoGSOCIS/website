# Exec

This file gives a description of all of the endpoints needed to create, update and view 
the executive members of SOCIS. All of these endpoints accept and return `Content-Type` 
`application/json`

## Overview of endpoints

<!-- ✘ | ✓ -->

| Implemented | HTTP Method | Endpoint | Description |
| ----- | ----- | ---- | ---- |
| ✓ | GET | [`/api/v1/execs`](#get-exec-list) | Get paged response of the execs |
| ✓ | POST | [`/api/v1/execs`](#new-exec) | Create new Executives |
| ✓ | PATCH | [`/api/v1/execs`](#update-exec) | This is used to update a list of execs, used to update a whole cohort|
| ✘ | DELETE | [`/api/v1/execs/:execId`](#delete-exec) | This will delete a single exec |


### Get Exec List

This will get a paged list of the execs. see [here](../response_objects.md#paging-object)
for more information. The list will be sorted based on each execs ordering value that is
set when they are created or edited. This will contain a list of [Exec Objects](../response_objects.md#exec-object)

#### Endpoint

`GET /api/v1/execs`


| Query Parameter | Type | Value |
| --------------- | ---- | ----- |
| year | integer | *Optional. * Default value is currentYear - 1 for Jan-April, or currentYear otherwise. |
| offset          | Integer | *Optional.* The offset into the results that you want, default value of 0
| limit           | Integer | *Optional.* The maximum number of results to get minimum 1 maximum 50 default 20 |


#### Success response

On success a paging object will be returned containing the list of executives.

#### Error responses

If the year is not a valid 4 digit year then an error message will be sent. see [here](../response_objects.md#generic-response-object)
for the error response format. 
 - `400 Bad Request`


### New Exec

This will create a new cohort of SOCIS executives. This will take a list of [Exec Objects](../response_objects.md#exec-object)
without the `id` field.
 
**This endpoint requires authentication**

#### Endpoint

`POST /api/v1/execs`


#### Success response

On success a list of Exec objects will be returned containing the list of executives that were just 
created. And the status will be `201 Created`.

#### Error responses

 - `400 Bad Request`
 - `401 Unauthorized`
 

### Update Exec

This will update a cohort of SOCIS executives. This will take a list of [Exec Objects](../response_objects.md#exec-object)

**This endpoint requires authentication**

#### Endpoint

`PATCH /api/v1/execs`

#### Success response

On success a list of Exec objects will be returned containing the list of executives that were just 
created. And the status will be `200 Okay`.

#### Error responses
If any of the updates fails then none of the changes will be accepted.

- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`

### Delete Exec

This will delete a single executive, this request takes no body.
**This endpoint requires authentication**

#### Endpoint

`DELETE /api/v1/execs/:execId`

#### Success response

On success the exec will be deleted and a generic response will be returned.
And the status will be `204 No Content`.

#### Error responses

- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`