<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## TypeORM Migrations

```bash
# Drop all tables
$ npm run db:drop

# Generate a new migration from entity changes
$ npm run db:migration:generate -- src/database/migrations/MigrationName

# Run pending migrations
$ npm run db:migration:run

# Seed the database
$ npm run db:seed
```

## Api Endpoints

This project includes a simple API endpoint for demonstration purposes. You can access the endpoint by sending a POST request to `/api/register`. The endpoint will return a greeting message.

```
| Method  | Endpoint                                                          | Description                                        |
|---------|-------------------------------------------------------------------|----------------------------------------------------|
| POST    | /api/auth/send-verification                                       | Returns a verification code                        |
| POST    | /api/auth/verify-code                                             | Returns a success message if the code is valid     |
| POST    | /api/auth/register                                                | Returns a registered user                          |
| POST    | /api/auth/login                                                   | Returns a logedin user with the jwt token          |
| POST    | /api/auth/logout                                                  | Returns a success message                          |
| POST    | /api/auth/refresh-token                                           | Generates a new pair of JWT token and refresh Token|
| POST    | /api/auth/forgot-password                                         | To be implemented                                  |
| POST    | /api/auth/reset-password                                          | To be implemented                                  |
| POST    | /api/roles/roles                                                  | Creates roles                                      |
| GET     | /api/roles/roles                                                  | Returns all roles                                  |
| GET     | /api/roles/roles/:id                                              | Returns a role by id                               |
| DELETE  | /api/roles/role/:id                                               | Deletes a role by id                               |
| POST    | /api/roles/assign-role                                            | Assigns role id to user id                         |
| DELETE  | /api/roles/assign-role/:userId/:roleId                            | Deletes a role by id                               |
| GET     | /api/roles/users/:userId/roles                                    | Returns a roles for user Id                        |
| GET     | /api/permissions/permissions                                      | Returns all permissions                            |
| POST    | /api/permissions/permissions                                      | Creates permissions                                |
| POST    | /api/permissions/assign-permission                                | Assigns permission id to role id                   |
| DELETE  | /api/permissions/assign-permission/:roleId/:permissionId          | Deletes a permission by id                         |
| POST    | /api/permissions/assign-user-permission                           | Assigns direct permission id to user id            |
| DELETE  | /api/permissions/assign-user-permission/:userId/:permissionId     | Deletes a direct permission by user id             |
| GET     | /api/permissions/users/:userId/direct-permissions                 | Returns all direct permissions for user id         |
| GET     | /api/permissions/users/:userId/permissions                        | Returns a permission by id                         |
| GET     | /api/business                                                     | Returns all businesses for the user or all         |
| POST    | /api/business                                                     | Creates a business for the user                    |
| GET     | /api/business/my-businesses                                       | Returns all businesses for the user                |
| GET     | /api/business/business/:id                                        | Returns a business by id                           |
| GET     | /api/business/business/:id/stats                                  | Returns stats for a business by id                 |
| PATCH   | /api/business/business/:id                                        | Updates a business by id                           |
| DELETE  | /api/business/business/:id                                        | Deletes a business by id                           |
| GET     | /api/business/schedule                                            | Returns all schedules for the user or all          |
| POST    | /api/business/schedule                                            | Creates a schedule for the user                    |
| GET     | /api/business/schedule/:id                                        | Returns a schedule by id                           |
| PATCH   | /api/business/schedule/:id                                        | Updates a schedule by id                           |
| DELETE  | /api/business/schedule/:id                                        | Deletes a schedule by id                           |
| GET     | /api/business/facility                                            | Returns all facilities for the user or all         |
| POST    | /api/business/facility                                            | Creates a facility for the user                    |
| GET     | /api/business/facility/:id                                        | Returns a facility by id                           |
| GET     | /api/business/facility/:id/locations                              | Returns all locations for a facility by id         |
| PATCH   | /api/business/facility/:id                                        | Updates a facility by id                           |
| PATCH   | /api/business/facility/:id/toggle-status                          | Toggles the active status of a facility by id      |
| DELETE  | /api/business/facility/:id                                        | Deletes a facility by id                           |
| GET     | /api/business/amenity                                             | Returns all amenities for the user or all          |
| POST    | /api/business/amenity                                             | Creates an amenity for the user                    |
| GET     | /api/business/amenity/:id                                         | Returns an amenity by id                           |
| GET     | /api/business/amenity/:id/locations                               | Returns all locations for an amenity by id         |
| PATCH   | /api/business/amenity/:id                                         | Updates an amenity by id                           |
| PATCH   | /api/business/amenity/:id/toggle-status                           | Toggles the active status of an amenity by id      |
| DELETE  | /api/business/amenity/:id                                         | Deletes an amenity by id                           |
| GET     | /api/business/locations                                           | Returns all locations for the user or all          |
| POST    | /api/business/locations                                           | Creates a location for the user                    |
| GET     | /api/business/locations/:id                                       | Returns a location by id                           |
| PATCH   | /api/business/locations/:id                                       | Updates a location by id                           |
| DELETE  | /api/business/locations/:id                                       | Deletes a location by id                           |
| POST    | /api/business/locations/:id/gallery                               | Uploads a gallery image for a location             |
| PATCH   | /api/business/locations/:locationId/facility/:facilityId/toggle-status | Toggles status of a facility for a location   |
| PATCH   | /api/business/locations/:locationId/amenity/:amenityId/toggle-status | Toggles status of an amenity for a location      |
| GET     | /api/business/events                                              | Returns all events for the user or all             |
| POST    | /api/business/events                                              | Creates an event for the user                      |
| GET     | /api/business/events/:id                                          | Returns an event by id                             |
| PATCH   | /api/business/events/:id                                          | Updates an event by id                             |
| DELETE  | /api/business/events/:id                                          | Deletes an event by id                             |
| GET     | /api/business/events/location/:locationId                         | Returns all events for a location by location id   |
| PATCH   | /api/business/events/:eventId/facility/:facilityId/toggle-status  | Toggles status of a facility for an event by ids   |
| GET     | /api/business/reservation                                         | Returns all reservations for the user or all       |
| POST    | /api/business/reservation                                         | Creates a reservation for the user                 |
| GET     | /api/business/reservation/by-event/:eventId                       | Returns all reservations for an event by event id  |
| GET     | /api/business/reservation/by-location/:locationId                 | Returns all reservations for a location by id      |
| GET     | /api/business/reservation/by-user/:userId                         | Returns all reservations for a user by user id     |
| GET     | /api/business/reservation/:id                                     | Returns a reservation by id                        |
| PATCH   | /api/business/reservation/:id                                     | Updates a reservation by id                        |
| DELETE  | /api/business/reservation/:id                                     | Deletes a reservation by id                        |
| POST    | /api/media/upload                                                 | Uploads a media file                               |
| GET     | /api/media                                                        | Returns all media files for the user or all        |
| DELETE  | /api/media/:id                                                    | Deletes a media file by id                         |
| GET     | /api/business/reviews                                             | Returns all reviews for the user or all            |
| POST    | /api/business/reviews                                             | Creates a review for the user                      |
| GET     | /api/business/reviews/:id                                         | Returns a review by id                             |
| PATCH   | /api/business/reviews/:id                                         | Updates a review by id                             |
| DELETE  | /api/business/reviews/:id                                         | Deletes a review by id                             |
| GET     | /api/business/reviews/location/:locationId                        | Returns all reviews for a location by location id  |
| GET     | /api/business/reviews/location/:locationId/stats                  | Returns review stats for a location by location id |
| GET     | /api/business/offers                                              | Returns all offers for the user or all             |
| POST    | /api/business/offers                                              | Creates an offer for the user                      |
| GET     | /api/business/offers/:id                                          | Returns an offer by id                             |
| PATCH   | /api/business/offers/:id                                          | Updates an offer by id                             |
| DELETE  | /api/business/offers/:id                                          | Deletes an offer by id                             |
| GET     | /api/business/offers/stats                                        | Returns offer stats for the user or all            |
| GET     | /api/business/offers/location/:locationId                         | Returns all offers for a location by location id   |
| GET     | /api/business/offers/category/:categoryId                         | Returns all offers for a category by category id   |
| GET     | /api/business/offer-categories                                    | Returns all offer categories for the user or all   |
| POST    | /api/business/offer-categories                                    | Creates an offer category for the user             |
| GET     | /api/business/offer-categories/:id                                | Returns an offer category by id                    |
| PATCH   | /api/business/offer-categories/:id                                | Updates an offer category by id                    |
| DELETE  | /api/business/offer-categories/:id                                | Deletes an offer category by id                    |
| GET     | /api/business/offer-categories/stats                              | Returns offer category stats for the user or all   |
| GET     | /api/business/offer-categories/:id/offers                         | Returns all offers for an offer category by id     |
| GET     | /api/users                                                        | Returns all users for the user or all              |
| GET     | /api/client/locations                                             | Returns all locations for the client user or all   |
| GET     | /api/client/location/:id                                          | Returns a location by id for the client user       |
| GET     | /api/client/events                                                | Returns all events for the client user or all      |
| GET     | /api/client/event/:id                                             | Returns an event by id for the client user         |
| GET     | /api/users/:id                                                    | Returns a user by id                               |
| PATCH   | /api/users/:id                                                    | Updates a user by id                               |
| DELETE  | /api/users/:id                                                    | Deletes a user by id                               |

```

## Auth Routes

- Send Verification Code

```
@post('api/auth/send-verification')
{
    "contact": "" // Must be a valid email address or phone number
}
```

You will receive a success message indicating that a verification code has been sent to the provided email address.

```
{
    "message": "Verification code sent successfully"
}
```

- Verify Code

```
@post('api/auth/verify-code')
{
    "contact": "", // Must be a valid email address
    "code": "" // Verification code sent to the email
}
```

You will receive a success message if the code is valid.

```
{
    "message": "Verification code is valid",
    "valid": true
}
```

If the code is invalid, you will receive an error message.

```
{
    "message": "Invalid or expired verification code",
    "valid": false
}
```

- Register

```
@post('api/auth/register')

{
    "email": "", // Unique must be a valid email address
    "name": "",
    "phone": "", // Unique must be 10 to 15 digits and may start with a plus sign
    "password": "Pass123" // Must contain at least one uppercase letter, one lowercase letter, and one number, minimum 6 characters
}
```

You will receive

```
{
    "message": "User created successfully",
    "data": {
        "id": "e6a2fa2b-0771-4d38-922c-0c01dd008a37",
        "email": "",
        "name": "",
        "phone": "",
        "ownerId": null,
        "createdAt": "2025-08-07T11:33:49.525Z",
        "updatedAt": "2025-08-07T11:33:49.525Z"
    }
}
```

- Login

```
@post('api/auth/login')

{
    "email": "",
    "password": ""
}
```

You will receive a JWT token upon successful login and refresh token, which you can use for subsequent requests that require authentication.

```
{
    "message": "Login successful",
    "data": {
        "id": "208b6d51-6c67-4596-9179-70329180e585",
        "email": "",
        "name": "",
        "phone": ",
        "ownerId": null,
        "createdAt": "2025-08-07T10:30:30.354Z",
        "updatedAt": "2025-08-07T10:30:30.354Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDhiNmQ1MS02YzY3LTQ1OTYtOTE3OS03MDMyOTE4MGU1ODUiLCJlbWFpbCI6ImZlcnlAbHpmLnJvIiwiaWF0IjoxNzU0NTYyNzE2LCJleHAiOjE3NTQ1NjM2MTZ9.Dg2CWfdU8cuPbnWt4lUP8Yi10G6TunzmS076DDvBD74",
    "refresh_token": "25eddbb1-b608-4654-ab64-849739d51fc2"
}
```

- Refresh Token

```
@post('api/auth/refresh-token')

{
    "refreshToken": "here goes your refresh token"
}
```

You will receive a new JWT token upon successful refresh and new refresh token.

```
{
    "message": "Tokens refreshed successfully",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDhiNmQ1MS02YzY3LTQ1OTYtOTE3OS03MDMyOTE4MGU1ODUiLCJlbWFpbCI6ImZlcnlAbHpmLnJvIiwiaWF0IjoxNzU0NTY0MjIyLCJleHAiOjE3NTQ1NjUxMjJ9.OGerIRQTXL_EvYfar4HMVs6nQ30vPR-6XnuD6M0qe7A",
    "refresh_token": "099f1999-6a92-469f-8fc6-a5801081717f"
}
```

- Logout

```
@post('api/auth/logout')

{
    "refreshToken": "here goes your refresh token"
}
```

You will receive a success message upon successful logout.

```
{
    "message": "Logout successful"
}
```

- Forgot Password

```
@post('api/auth/forgot-password')

{
    "email": "
}
```

You will receive a success message indicating that a password reset link has been sent to the provided email address.

```
{
    "message": "If the email exists, a password reset link has been sent"
}
```

- Reset Password

```
@post('api/auth/reset-password')

{
    "token": "ac4f27d7824b11aa963393098eb51d79f034ae5bc4d28572d737d266a5f599e4",
    "password": "NewPassword"
}
```

You will receive a success message indicating that the password has been reset successfully.

```
{
    "message": "Password reset successful"
}
```

## Roles

- Roles get all

```
@get('api/roles/roles')

```

You will receive a list of all roles with users attached.

```
{
    [
        {
            "id": "42d8c5b0-7aac-4c90-9ec3-03f606edee41",
            "name": "BUSINESS_ADMIN",
            "rolePermissions": [],
            "userRoles": []
        },
        {
            "id": "2002bf01-fec7-42e3-b9fb-1bb24e31fee6",
            "name": "PLATFORM_ROOT",
            "rolePermissions": [],
            "userRoles": [
                {
                    "userId": "aa967464-52c7-4ecc-85dc-4aa7743907c3",
                    "roleId": "2002bf01-fec7-42e3-b9fb-1bb24e31fee6",
                    "assignedAt": "2025-08-08T14:01:42.666Z",
                    "user": {
                        "id": "aa967464-52c7-4ecc-85dc-4aa7743907c3",
                        "name": "",
                        "email": ""
                    }
                }
            ]
        }
    ]
}
```

- Roles create

```
@post('api/roles/roles')
{
    "name": "PLATFORM_ROOT" // Unique role name
}
```

You will receive a success message indicating that the role has been created.

```
{
    "message": "Role created successfully",
    "data": {
        "id": "83e52c07-67cc-4079-9015-07c57b0ef463",
        "name": "PLATFORM_ROOT"
    }
}
```

- Roles get by id

```
@get('api/roles/roles/:id')
```

You will receive a role by its ID.

```
{
    "id": "2002bf01-fec7-42e3-b9fb-1bb24e31fee6",
    "name": "PLATFORM_ROOT",
    "rolePermissions": [],
    "userRoles": [
        {
            "userId": "aa967464-52c7-4ecc-85dc-4aa7743907c3",
            "roleId": "2002bf01-fec7-42e3-b9fb-1bb24e31fee6",
            "assignedAt": "2025-08-08T14:01:42.666Z",
            "user": {
                "id": "aa967464-52c7-4ecc-85dc-4aa7743907c3",
                "name": "",
                "email": ""
            }
        }
    ]
}
```

- Roles delete by id

```
@delete('api/roles/role/:id')
```

You will receive a success message indicating that the role has been deleted.

```
{
    "message": "Role deleted successfully"
}
```

- Roles assign role to user

```
@post('api/roles/assign-role')

{
    "userId": "aa967464-52c7-4ecc-85dc-4aa7743907c3", // User ID to assign the role
    "roleId": "2002bf01-fec7-42e3-b9fb-1bb24e31fee6" // Role ID to assign
}
```

You will receive a success message indicating that the role has been assigned to the user.

```
{
    "message": "Role assigned to user successfully",
    "data": {
        "userId": "aa967464-52c7-4ecc-85dc-4aa7743907c3",
        "roleId": "e20e7208-1a10-4066-bf63-1b4e8062a729",
        "assignedAt": "2025-08-11T11:24:24.385Z",
        "user": {
            "id": "aa967464-52c7-4ecc-85dc-4aa7743907c3",
            "name": "",
            "email": ""
        },
        "role": {
            "id": "e20e7208-1a10-4066-bf63-1b4e8062a729",
            "name": "PLATFORM_MANAGER"
        }
    }
}
```

- Roles delete role from user

```
@delete('api/roles/assign-role/:userId/:roleId')
```

You will receive a success message indicating that the role has been deleted from the user.

```
{
    "message": "Role removed from user successfully"
}
```

- Roles get user roles

```
@get('api/roles/users/:userId/roles')
```

You will receive a list of roles assigned to the user.

```
[
    {
        "userId": "aa967464-52c7-4ecc-85dc-4aa7743907c3",
        "roleId": "2002bf01-fec7-42e3-b9fb-1bb24e31fee6",
        "assignedAt": "2025-08-08T14:01:42.666Z",
        "role": {
            "id": "2002bf01-fec7-42e3-b9fb-1bb24e31fee6",
            "name": "PLATFORM_ROOT",
            "rolePermissions": []
        }
    },
    {
        "userId": "aa967464-52c7-4ecc-85dc-4aa7743907c3",
        "roleId": "54c5f840-e2f0-46cc-8383-9913fb3a253a",
        "assignedAt": "2025-08-11T11:03:57.996Z",
        "role": {
            "id": "54c5f840-e2f0-46cc-8383-9913fb3a253a",
            "name": "CLIENT1",
            "rolePermissions": []
        }
    }
]
```

- Permissions

```
@get('api/permissions/permissions')
```

You will receive a list of all permissions.

```
[
    {
        "id": "fa227944-b778-4250-9d6f-443a3c0d6a6c",
        "name": "create:any",
        "rolePermissions": [
            {
                "roleId": "8edb0c3d-6010-48b8-b4d7-e1262a9b4ca5",
                "permissionId": "fa227944-b778-4250-9d6f-443a3c0d6a6c",
                "role": {
                    "id": "8edb0c3d-6010-48b8-b4d7-e1262a9b4ca5",
                    "name": "PLATFORM_ROOT"
                }
            }
        ]
    },
    {
        "id": "5a8a0c6f-ae99-4359-a2d0-a49b37f5311a",
        "name": "create:own",
        "rolePermissions": []
    },
    {
        "id": "a679099d-1981-4302-9892-80d29af4847e",
        "name": "create:users",
        "rolePermissions": []
    },
    {
        "id": "fa2c3cb8-0916-40b1-9b73-ed9d29e81a68",
        "name": "delete:any",
        "rolePermissions": []
    },
    {
        "id": "776d42ce-076b-4111-addf-7f98a5b95f4a",
        "name": "delete:own",
        "rolePermissions": []
    },
    {
        "id": "da83480b-5d4c-4567-86d9-bb4027019359",
        "name": "read:any",
        "rolePermissions": []
    },
    {
        "id": "da676fe2-e3c8-4f41-8f35-4b2cd07080d6",
        "name": "read:own",
        "rolePermissions": [
            {
                "roleId": "bd61d60e-5709-451f-b0cd-07140ce5e52b",
                "permissionId": "da676fe2-e3c8-4f41-8f35-4b2cd07080d6",
                "role": {
                    "id": "bd61d60e-5709-451f-b0cd-07140ce5e52b",
                    "name": "CLIENT_USER"
                }
            }
        ]
    },
    {
        "id": "b3d09e6a-9a42-4d53-893e-b30cf37cc759",
        "name": "update:any",
        "rolePermissions": []
    },
    {
        "id": "19593bb3-6b44-40ef-b20a-d45c30a6fad4",
        "name": "update:own",
        "rolePermissions": []
    }
]
```

- Permissions create

```
@post('api/permissions/permissions')
{
    "name": "read:users" // Unique permission name
}
```

You will receive a success message indicating that the permission has been created.

```
{
    "message": "Permission created successfully",
    "data": {
        "id": "0cfbd560-1d5f-440c-8366-a52ea602b936",
        "name": "create:all"
    }
}
```

- Permissions assign permission to role

```
@post('api/permissions/assign-permission')
{
    "roleId": "2002bf01-fec7-42e3-b9fb-1bb24e31fee6", // Role ID to assign the permission
    "permissionId": "da676fe2-e3c8-4f41-8f35-4b2cd07080d6" // Permission ID to assign
}
```

You will receive a success message indicating that the permission has been assigned to the role.

```
{
    "message": "Permission assigned to role successfully",
    "data": {
        "roleId": "8edb0c3d-6010-48b8-b4d7-e1262a9b4ca5",
        "permissionId": "0cfbd560-1d5f-440c-8366-a52ea602b936",
        "role": {
            "id": "8edb0c3d-6010-48b8-b4d7-e1262a9b4ca5",
            "name": "PLATFORM_ROOT"
        },
        "permission": {
            "id": "0cfbd560-1d5f-440c-8366-a52ea602b936",
            "name": "create:all"
        }
    }
}
```

- Permissions delete permission from role

```
@delete('api/permissions/assign-permission/:roleId/:permissionId')
```

You will receive a success message indicating that the permission has been deleted from the role.

```
{
    "message": "Permission removed from role successfully"
}
```

- Permissions assign permission to user

```
@post('api/permissions/assign-user-permission')
{
    "userId": "aa967464-52c7-4ecc-85dc-4aa7743907c3", // User ID to assign the permission
    "permissionId": "da676fe2-e3c8-4f41-8f35-4b2cd07080d6" // Permission ID to assign
}
```

You will receive a success message indicating that the permission has been assigned to the user.

```
{
    "message": "Permission assigned to user successfully",
    "data": {
        "userId": "aa967464-52c7-4ecc-85dc-4aa7743907c3",
        "permissionId": "da676fe2-e3c8-4f41-8f35-4b2cd07080d6",
        "assignedAt": "2025-08-11T11:24:24.385Z",
        "user": {
            "id": "aa967464-52c7-4ecc-85dc-4aa7743907c3",
            "name": "",
            "email": ""
        },
        "permission": {
            "id": "da676fe2-e3c8-4f41-8f35-4b2cd07080d6",
            "name": "read:own"
        }
    }
}
```

- Permissions delete permission from user

```
@delete('api/permissions/assign-user-permission/:userId/:permissionId')
```

You will receive a success message indicating that the permission has been deleted from the user.

```
{
    "message": "Permission removed from user successfully"
}
```

## Permissions for Users

```
@get('api/permissions/users/:userId/direct-permissions')
```

You will receive a list of direct permissions assigned to the user.

```
[
    {
        "userId": "aa967464-52c7-4ecc-85dc-4aa7743907c3",
        "permissionId": "da676fe2-e3c8-4f41-8f35-4b2cd07080d6",
        "assignedAt": "2025-08-11T11:24:24.385Z",
        "permission": {
            "id": "da676fe2-e3c8-4f41-8f35-4b2cd07080d6",
            "name": "read:own"
        }
    },
    {
        "userId": "aa967464-52c7-4ecc-85dc-4aa7743907c3",
        "permissionId": "b3d09e6a-9a42-4d53-893e-b30cf37cc759",
        "assignedAt": "2025-08-11T11:24:24.385Z",
        "permission": {
            "id": "b3d09e6a-9a42-4d53-893e-b30cf37cc759",
            "name": "update:any"
        }
    }
]
```

- Permissions get user permission by id

```
@get('api/permissions/users/:userId/permissions')
```

You will receive a permission by its ID.

```
{
    "id": "da676fe2-e3c8-4f41-8f35-4b2cd07080d6",
    "name": "read:own",
    "rolePermissions": [],
    "userPermissions": [
        {
            "userId": "aa967464-52c7-4ecc-85dc-4aa7743907c3",
            "permissionId": "da676fe2-e3c8-4f41-8f35-4b2cd07080d6",
            "assignedAt": "2025-08-11T11:24:24.385Z",
            "user": {
                "id": "aa967464-52c7-4ecc-85dc-4aa7743907c3",
                "name": "",
                "email": ""
            }
        }
    ]
}
```

## Business

- Business get all

```
@get('api/business')
```

You will receive a list of all businesses for the user or all businesses.

```
{
    "businesses": [
        {
            "id": "1eabad70-3e34-4514-901b-cec083bd91c0",
            "name": "Arena24 Concept",
            "description": "Arena 24 Concept Restaurants",
            "ownerId": "8abbbc42-e2f8-4b67-9be6-e3a659eaa525",
            "createdAt": "2025-08-20T14:35:53.206Z",
            "updatedAt": "2025-08-20T14:48:32.084Z",
            "owner": {
                "id": "8abbbc42-e2f8-4b67-9be6-e3a659eaa525",
                "name": "Fery LZF",
                "email": "fery@lzf.ro"
            },
            "locations": [
                {
                    "id": 1,
                    "name": "Studio 80",
                    "type": "Restaurant",
                    "isActive": true
                },
                {
                    "id": 2,
                    "name": "Arena 24",
                    "type": "Pub",
                    "isActive": true
                }
            ],
            "_count": {
                "locations": 2,
                "userRoles": 0
            }
        }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
}
```

- Business create

```
@post('api/business')
{
    "name": "Arena24 Concept",
    "description": "Arena 24"
}
```

You will receive a success message indicating that the business has been created.

```
{
    "message": "Business created successfully",
    "data": {
        "id": "b1c2d3e4-f5a6-78a9-b0c1d2e3f4g5",
        "name": "My New Business",
        "ownerId": "aa967464-52c7-4ecc-85dc-4aa7743907c3",
        "createdAt": "2025-08-07T10:30:30.354Z",
        "updatedAt": "2025-08-07T10:30:30.354Z",
        "owner": {
            "id": "aa967464-52c7-4ecc-85dc-4aa7743907c3",
            "name": "",
            "email": "",
            "phone": "",
            "ownerId": null,
            "createdAt": "2025-08-07T10:30:30.354Z",
            "updatedAt": "2025-08-07T10:30:30.354Z"
        }
    }
}
```

- Business get my businesses

```
@get('api/business/my-businesses')
```

You will receive a list of all businesses for the user.

```
[
    {
        "id": "1eabad70-3e34-4514-901b-cec083bd91c0",
        "name": "Arena24 Concept",
        "description": "Arena 24 Concept Restaurants",
        "ownerId": "8abbbc42-e2f8-4b67-9be6-e3a659eaa525",
        "createdAt": "2025-08-20T14:35:53.206Z",
        "updatedAt": "2025-08-20T14:48:32.084Z",
        "owner": {
            "id": "8abbbc42-e2f8-4b67-9be6-e3a659eaa525",
            "name": "Fery LZF",
            "email": "fery@lzf.ro"
        },
        "locations": [
            {
                "id": 1,
                "name": "Studio 80",
                "type": "Restaurant",
                "isActive": true
            },
            {
                "id": 2,
                "name": "Arena 24",
                "type": "Pub",
                "isActive": true
            }
        ]
    }
]
```

- Business get by id

```
@get('api/business/business/:id')
```

You will receive a business by its ID.

```
{
    "id": "1eabad70-3e34-4514-901b-cec083bd91c0",
    "name": "Arena24 Concept",
    "description": "Arena 24 Concept Restaurants",
    "ownerId": "8abbbc42-e2f8-4b67-9be6-e3a659eaa525",
    "createdAt": "2025-08-20T14:35:53.206Z",
    "updatedAt": "2025-08-20T14:48:32.084Z",
    "owner": {
        "id": "8abbbc42-e2f8-4b67-9be6-e3a659eaa525",
        "name": "Fery LZF",
        "email": "fery@lzf.ro"
    },
    "locations": [
        {
            "id": 1,
            "type": "Restaurant",
            "name": "Studio 80",
            "address": "Baneasa",
            "contact": "0728377248",
            "capacity": 101,
            "latitude": 41.25123,
            "longitude": 25.684368,
            "experience": "Fine Dining",
            "amenities": null,
            "imageUrl": null,
            "description": "lorem ipsun etc etc",
            "isActive": true,
            "deletedAt": null,
            "openingHours": "10:00",
            "businessId": "1eabad70-3e34-4514-901b-cec083bd91c0",
            "ownerId": "8abbbc42-e2f8-4b67-9be6-e3a659eaa525",
            "createdAt": "2025-08-21T12:23:22.506Z",
            "updatedAt": "2025-08-21T12:23:22.506Z",
            "managers": [],
            "schedule": [],
            "LocationFacility": [],
            "LocationAmenity": []
        },
        {
            "id": 2,
            "type": "Pub",
            "name": "Arena 24",
            "address": "Baneasa nr xx gradina zoologica",
            "contact": "0728377248",
            "capacity": 49,
            "latitude": 53.332323,
            "longitude": 23.894977,
            "experience": "Fine wine degustare",
            "amenities": null,
            "imageUrl": "/uploads/restaurants/covers/1755780089162-552607917.jpg",
            "description": "descriere puv",
            "isActive": true,
            "deletedAt": null,
            "openingHours": "09:00",
            "businessId": "1eabad70-3e34-4514-901b-cec083bd91c0",
            "ownerId": "8abbbc42-e2f8-4b67-9be6-e3a659eaa525",
            "createdAt": "2025-08-21T12:41:29.174Z",
            "updatedAt": "2025-08-21T12:41:29.174Z",
            "managers": [],
            "schedule": [],
            "LocationFacility": [],
            "LocationAmenity": []
        }
    ],
    "userRoles": [],
    "_count": {
        "locations": 2,
        "userRoles": 0
    }
}
```

- Business get stats by id

```
@get('api/business/business/:id/stats')
```

You will receive stats for a business by its ID.

```
{
    "totalLocations": 2,
    "activeLocations": 2,
    "totalStaff": 0,
    "businessAge": 1
}
```

- Business update by id

```
@patch('api/business/business/:id')
{
    "name": "Updated Business Name",
    "description": "Updated Business Description"
}
```

You will receive a success message indicating that the business has been updated.

```
{
    "message": "Business updated successfully",
    "data": {
        "id": "1eabad70-3e34-4514-901b-cec083bd91c0",
        "name": "Updated Business Name",
        "description": "Updated Business Description",
        "ownerId": "8abbbc42-e2f8-4b67-9be6-e3a659eaa525",
        "createdAt": "2025-08-20T14:35:53.206Z",
        "updatedAt": "2025-08-20T14:48:32.084Z",
        "owner": {
            "id": "8abbbc42-e2f8-4b67-9be6-e3a659eaa525",
            "name": "Fery LZF",
            "email": "",
            "phone": "",
            "ownerId": null,
            "createdAt": "2025-08-20T14:35:53.206Z",
            "updatedAt": "2025-08-20T14:48:32.084Z"
        }
    }
}
```

- Business delete by id

```
@delete('api/business/business/:id')
```

You will receive a success message indicating that the business has been deleted.

```
{
    "message": "Business deleted successfully"
}
```

## Offers

Oferte globale sau legate de o locatie

```
// Example queries supported:
// ?activeOnly=true - Show only currently active offers
// ?globalOnly=true - Show only global offers (no location)
// ?locationId=1&categoryId=2 - Specific location and category
// ?minDiscount=20 - Only offers with 20%+ discount
// ?name=pizza - Search offers containing "pizza"
// ?startDate=2025-08-01&endDate=2025-12-31 - Date range filtering
```

## Roles and Permissions usage

Flexible @Authorize Decorator

```
@Authorize({
roles: ['PLATFORM_ADMIN', 'BUSINESS_OWNER'],
permissions: ['read:users'],
operator: 'OR' // Default is 'OR'
})
```

@HasRoleOr(['ADMIN'], ['read:users']) - Has ADMIN role OR read:users permission
@RequireRole('ADMIN') - Must have ADMIN role
@RequirePermission('read:users') - Must have read:users permission

Multiple roles OR permission:

```
@Authorize({
roles: ['PLATFORM_ADMIN', 'BUSINESS_OWNER', 'PLATFORM_MANAGER'],
permissions: ['read:own']
})
```

Convenience syntax:

```
@HasRoleOr(['BUSINESS_OWNER', 'PLATFORM_MANAGER'], ['read:own'])
```

Permission-only:

```
@RequirePermission('update:user')
```

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
