# Products

This document describes the routes to create, update, delete and list the events. 
These are the items that are being sold in the store as SOCIS merch.


## Overview of endpoints

<!-- ✘ | ✓ -->

| Implemented | HTTP Method | Endpoint | Description |
| ----- | ----- | ---- | ---- |
| ✘ | POST | [`/api/v1/products`](#new-product) | Create a new product |
| ✘ | PATCH | [`/api/v1/products/:productId`](#update-product) | This is used to update a single product|
| ✘ | DELETE | [`/api/v1/products/:productId`](#delete-product) | This will delete an product |


### New Product

This will create a new product for the merch store. This will take a single [Product Object](../response_objects.md#product-object)
without the `id` field.
 
**This endpoint requires authentication**

#### Endpoint

`POST /api/v1/products`


#### Success response

On success a full product object will returned that was just created. And the status will be `201 Created`.

#### Error responses

 - `400 Bad Request`
 - `401 Unauthorized`
 

### Update product

This will update a single product. This will take a single [Product Object](../response_objects.md#product-object)
Note that the `id` can not be changed. 
 
**This endpoint requires authentication**

#### Endpoint

`PATCH /api/v1/products/:productId`

#### Success response

On success a [generic response object](../response_objects.md#generic-response-object) will be returned and 
 the status will be `200 Okay`.

#### Error responses
If any of the updates fails then none of the changes will be accepted.

- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`


### Delete product

This will delete a single product from the store, this request takes no body.

**This endpoint requires authentication**

#### Endpoint

`DELETE /api/v1/products/:productId`

#### Success response

On success the product will be deleted and a generic response will be returned.
And the status will be `204 No Content`.

#### Error responses

- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`