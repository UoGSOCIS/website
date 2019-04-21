# Roboticon

This document describes the routes to create, update, delete and list the roboticon challenges. 

## Overview of endpoints

<!-- ✘ | ✓ -->

| Implemented | HTTP Method | Endpoint | Description |
| ----- | ----- | ---- | ---- |
| ✘ | POST | [`/api/v1/roboticon`](#new-challenge) | Create a new Roboticon Challenge |
| ✘ | PATCH | [`/api/v1/roboticon/:year/:challengeNum`](#update-challenge) | This is used to update a single challenge|
| ✘ | DELETE | [`/api/v1/robotion/:year/:challengeNum`](#delete-challenge) | This will delete a challenge |


### New Challenge

This will create a new Roboticon challenge. This will take a single [Roboticon Object](../response_objects.md#roboticon-challenge-object)
without the `id` field, the `image` and `map` fields will be the base64 image.
 
**This endpoint requires authentication**

#### Endpoint

`POST /api/v1/roboticon`


#### Success response

On success a full Roboticon object will returned that was just created. And the status will be `201 Created`.

#### Error responses

 - `400 Bad Request`
 - `401 Unauthorized`
 

### Update Challenge

This will update a single Roboticon challenge. This will take a single [Roboticon Object](../response_objects.md#roboticon-challenge-object)
Note that the `id` can not be changed, if the `year` / `challenge_number` is being changes to one that already exists
then the update will fail. Also if the images are not being updated then the base64 contents for the image do not need
to be re-uploaded.
 
**This endpoint requires authentication**

#### Endpoint

`PATCH /api/v1/roboticon/:year/:challengeNum`

#### Success response

On success a [generic response object](../response_objects.md#generic-response-object) will be returned and 
 the status will be `200 Okay`.

#### Error responses
If any of the updates fails then none of the changes will be accepted.

- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`


### Delete Challenge

This will delete a single Roboticon Challenge, this request takes no body.
**This endpoint requires authentication**

#### Endpoint

`DELETE /api/v1/roboticon/:year/:challengeNum`

#### Success response

On success the challenge will be deleted and a generic response will be returned.
And the status will be `204 No Content`.

#### Error responses

- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`