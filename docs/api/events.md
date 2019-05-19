# Events

This document describes the routes to create, update, delete and list the events. 

## Overview of endpoints

<!-- ✘ | ✓ -->

| Implemented | HTTP Method | Endpoint | Description |
| ----- | ----- | ---- | ---- |
| ✓ | POST | [`/api/v1/events`](#new-event) | Create a new event |
| ✓ | PATCH | [`/api/v1/events/:eventId`](#update-event) | This is used to update a single event|
| ✓ | DELETE | [`/api/v1/events/:eventId`](#delete-event) | This will delete an event |


### New Event

This will create a new Event. This will take a single [Event Object](../response_objects.md#event-object)
without the `id` field.

This endpoint will also have the side effect of creating an event on the SOCIS calender.
 
**This endpoint requires authentication**

#### Endpoint

`POST /api/v1/events`


#### Success response

On success a full Event object will returned that was just created. And the status will be `201 Created`.

#### Error responses

 - `400 Bad Request`
 - `401 Unauthorized`
 

### Update Event

This will update a single event. This will take a single [Event Object](../response_objects.md#event-object)
Note that the `id` can not be changed. 

This will also update the event in the google calender.
 
**This endpoint requires authentication**

#### Endpoint

`PATCH /api/v1/events/:eventId`

#### Success response

On success the updated  [event response object](../response_objects.md#event-object) will be returned and 
 the status will be `200 Okay`.

#### Error responses
If any of the updates fails then none of the changes will be accepted.

- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`


### Delete event

This will delete a single Event, this request takes no body.

This will also remove the event from the google calender.

**This endpoint requires authentication**

#### Endpoint

`DELETE /api/v1/events/:eventId`

#### Success response

On success the event will be deleted and a generic response will be returned.
And the status will be `204 No Content`.

#### Error responses

- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`