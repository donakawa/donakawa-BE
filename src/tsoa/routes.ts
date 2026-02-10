/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { WishlistController } from './../wishlist/controller/wishlist.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { HistoriesController } from './../histories/controller/histories.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GoalsController } from './../goals/controller/goals.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ChatsController } from './../chats/controller/chats.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from './../auth/controller/auth.controller';
import { expressAuthentication } from './../auth/middleware/auth.middleware';
// @ts-ignore - no great way to install types from subpackage
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';
const multer = require('multer');


const expressAuthenticationRecasted = expressAuthentication as (req: ExRequest, securityName: string, scopes?: string[], res?: ExResponse) => Promise<any>;


// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "AddCrawlTaskResponseDto": {
        "dataType": "refObject",
        "properties": {
            "jobId": {"dataType":"string","required":true},
            "requestedAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_AddCrawlTaskResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"AddCrawlTaskResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AddCrawlTaskRequestDto": {
        "dataType": "refObject",
        "properties": {
            "url": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetCrawlResultResponseDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "productName": {"dataType":"string","required":true},
            "brandName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "platformName": {"dataType":"string","required":true},
            "productId": {"dataType":"string","required":true},
            "price": {"dataType":"double","required":true},
            "updatedAt": {"dataType":"string","required":true},
            "imageUrl": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"undefined"}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_GetCrawlResultResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"GetCrawlResultResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AddWishListFromCacheResponseDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_AddWishListFromCacheResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"AddWishListFromCacheResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AddWishlistResponseDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_AddWishlistResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"AddWishlistResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ShowWishitemDetailResponseDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "folder": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "name": {"dataType":"string","required":true},
            "price": {"dataType":"double","required":true},
            "platform": {"dataType":"string","required":true},
            "brand": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "photoUrl": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "productUrl": {"dataType":"string","required":true},
            "reason": {"dataType":"string","required":true},
            "refreshedAt": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "addedAt": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "updatedAt": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "status": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_ShowWishitemDetailResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"ShowWishitemDetailResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "WishitemType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["AUTO"]},{"dataType":"enum","enums":["MANUAL"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "WishitemStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["WISHLISTED"]},{"dataType":"enum","enums":["DROPPED"]},{"dataType":"enum","enums":["BOUGHT"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "WishItemPreviewPayload": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "brandName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "price": {"dataType":"double","required":true},
            "photoUrl": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "type": {"ref":"WishitemType","required":true},
            "status": {"ref":"WishitemStatus","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ShowWishitemListResponseDto": {
        "dataType": "refObject",
        "properties": {
            "nextCursor": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "wishitems": {"dataType":"array","array":{"dataType":"refObject","ref":"WishItemPreviewPayload"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_ShowWishitemListResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"ShowWishitemListResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "WishItemFolderPayload": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ShowWishitemFoldersResponseDto": {
        "dataType": "refObject",
        "properties": {
            "folders": {"dataType":"array","array":{"dataType":"refObject","ref":"WishItemFolderPayload"},"required":true},
            "nextCursor": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_ShowWishitemFoldersResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"ShowWishitemFoldersResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateWishitemFolderResponseDto": {
        "dataType": "refObject",
        "properties": {
            "folderId": {"dataType":"string","required":true},
            "createdAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_CreateWishitemFolderResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"CreateWishitemFolderResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChangeWishitemFolderLocationRequestDto": {
        "dataType": "refObject",
        "properties": {
            "type": {"dataType":"string","required":true},
            "folderId": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.PurchasedAt": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["MORNING"]},{"dataType":"enum","enums":["EVENING"]},{"dataType":"enum","enums":["NIGHT"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PurchasedAt": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.PurchasedAt","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MarkItemAsPurchasedRequestDto": {
        "dataType": "refObject",
        "properties": {
            "type": {"dataType":"string","required":true},
            "date": {"dataType":"string","required":true},
            "purchasedAt": {"ref":"PurchasedAt","required":true},
            "reasonId": {"dataType":"double"},
            "reason": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ShowWishitemsInFolderResponseDto": {
        "dataType": "refObject",
        "properties": {
            "nextCursor": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "wishitems": {"dataType":"array","array":{"dataType":"refObject","ref":"WishItemPreviewPayload"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_ShowWishitemsInFolderResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"ShowWishitemsInFolderResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ModifyWishitemResponseDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "folder": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "name": {"dataType":"string","required":true},
            "price": {"dataType":"double","required":true},
            "platform": {"dataType":"string","required":true},
            "brand": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "photoUrl": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "productUrl": {"dataType":"string","required":true},
            "reason": {"dataType":"string","required":true},
            "refreshedAt": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "addedAt": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "updatedAt": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "status": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_ModifyWishitemResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"ModifyWishitemResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateReviewResponseDto": {
        "dataType": "refObject",
        "properties": {
            "reviewId": {"dataType":"double","required":true},
            "itemId": {"dataType":"double","required":true},
            "satisfaction": {"dataType":"double","required":true},
            "frequency": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_CreateReviewResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"CreateReviewResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateReviewRequestDto": {
        "dataType": "refObject",
        "properties": {
            "satisfaction": {"dataType":"double","required":true},
            "frequency": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ReviewItemResponseDto": {
        "dataType": "refObject",
        "properties": {
            "reviewId": {"dataType":"double","required":true},
            "itemId": {"dataType":"double","required":true},
            "itemName": {"dataType":"string","required":true},
            "price": {"dataType":"double","required":true},
            "imageUrl": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "purchaseReasons": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "satisfactionScore": {"dataType":"double","required":true},
            "purchasedAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetMyReviewsResponseDto": {
        "dataType": "refObject",
        "properties": {
            "reviewCount": {"dataType":"double","required":true},
            "reviews": {"dataType":"array","array":{"dataType":"refObject","ref":"ReviewItemResponseDto"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_GetMyReviewsResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"GetMyReviewsResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CalendarSummaryDto": {
        "dataType": "refObject",
        "properties": {
            "totalAmount": {"dataType":"double","required":true},
            "purchaseCount": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CalendarDayDto": {
        "dataType": "refObject",
        "properties": {
            "date": {"dataType":"string","required":true},
            "purchaseCount": {"dataType":"double","required":true},
            "totalAmount": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CalendarItemDto": {
        "dataType": "refObject",
        "properties": {
            "itemId": {"dataType":"double","required":true},
            "itemType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["AUTO"]},{"dataType":"enum","enums":["MANUAL"]}],"required":true},
            "name": {"dataType":"string","required":true},
            "price": {"dataType":"double","required":true},
            "thumbnailUrl": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "purchasedAt": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["MORNING"]},{"dataType":"enum","enums":["EVENING"]},{"dataType":"enum","enums":["NIGHT"]}],"required":true},
            "satisfaction": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_string.CalendarItemDto-Array_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"array","array":{"dataType":"refObject","ref":"CalendarItemDto"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MonthlyCalendarResponseDto": {
        "dataType": "refObject",
        "properties": {
            "year": {"dataType":"double","required":true},
            "month": {"dataType":"double","required":true},
            "summary": {"ref":"CalendarSummaryDto","required":true},
            "calendar": {"dataType":"array","array":{"dataType":"refObject","ref":"CalendarDayDto"},"required":true},
            "itemsByDate": {"ref":"Record_string.CalendarItemDto-Array_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_MonthlyCalendarResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"MonthlyCalendarResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DailyHistorySummaryDto": {
        "dataType": "refObject",
        "properties": {
            "totalAmount": {"dataType":"double","required":true},
            "purchaseCount": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DailyHistoryItemDto": {
        "dataType": "refObject",
        "properties": {
            "itemId": {"dataType":"double","required":true},
            "itemType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["AUTO"]},{"dataType":"enum","enums":["MANUAL"]}],"required":true},
            "name": {"dataType":"string","required":true},
            "price": {"dataType":"double","required":true},
            "thumbnailUrl": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "purchasedAt": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["MORNING"]},{"dataType":"enum","enums":["EVENING"]},{"dataType":"enum","enums":["NIGHT"]}],"required":true},
            "satisfaction": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetDailyHistoriesResponseDto": {
        "dataType": "refObject",
        "properties": {
            "date": {"dataType":"string","required":true},
            "summary": {"ref":"DailyHistorySummaryDto","required":true},
            "items": {"dataType":"array","array":{"dataType":"refObject","ref":"DailyHistoryItemDto"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_GetDailyHistoriesResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"GetDailyHistoriesResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HistoryItemDto": {
        "dataType": "refObject",
        "properties": {
            "reviewId": {"dataType":"double"},
            "itemId": {"dataType":"double","required":true},
            "itemName": {"dataType":"string","required":true},
            "price": {"dataType":"double","required":true},
            "imageUrl": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "purchaseReasons": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "purchasedAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetHistoryItemsResponseDto": {
        "dataType": "refObject",
        "properties": {
            "items": {"dataType":"array","array":{"dataType":"refObject","ref":"HistoryItemDto"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_GetHistoryItemsResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"GetHistoryItemsResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ReviewStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ALL"]},{"dataType":"enum","enums":["WRITTEN"]},{"dataType":"enum","enums":["NOT_WRITTEN"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ReportPeriodDto": {
        "dataType": "refObject",
        "properties": {
            "from": {"dataType":"string","required":true},
            "to": {"dataType":"string","required":true},
            "days": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ReportSummaryDto": {
        "dataType": "refObject",
        "properties": {
            "totalSpent": {"dataType":"double","required":true},
            "savedAmount": {"dataType":"double","required":true},
            "averageSatisfaction": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ReportReasonDto": {
        "dataType": "refObject",
        "properties": {
            "reason": {"dataType":"string","required":true},
            "count": {"dataType":"double","required":true},
            "averageSatisfaction": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MonthlyReportResponseDto": {
        "dataType": "refObject",
        "properties": {
            "period": {"ref":"ReportPeriodDto","required":true},
            "summary": {"ref":"ReportSummaryDto","required":true},
            "topReasons": {"dataType":"array","array":{"dataType":"refObject","ref":"ReportReasonDto"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_MonthlyReportResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"MonthlyReportResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AnalyticsStatistic": {
        "dataType": "refObject",
        "properties": {
            "label": {"dataType":"string","required":true},
            "displayName": {"dataType":"string","required":true},
            "count": {"dataType":"double","required":true},
            "percentage": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AnalyticsResponseDto": {
        "dataType": "refObject",
        "properties": {
            "metric": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["TIME"]},{"dataType":"enum","enums":["DAY"]}],"required":true},
            "totalCount": {"dataType":"double","required":true},
            "statistics": {"dataType":"array","array":{"dataType":"refObject","ref":"AnalyticsStatistic"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_AnalyticsResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"AnalyticsResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AnalyticsMetric": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["time"]},{"dataType":"enum","enums":["day"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AiCommentResponseDto": {
        "dataType": "refObject",
        "properties": {
            "comment": {"dataType":"string","required":true},
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["positive"]},{"dataType":"enum","enums":["negative"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_AiCommentResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"AiCommentResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CalcShoppingBudgetResponseDto": {
        "dataType": "refObject",
        "properties": {
            "shoppingBudget": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_CalcShoppingBudgetResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"CalcShoppingBudgetResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CalcShoppingBudgetRequestDto": {
        "dataType": "refObject",
        "properties": {
            "monthlyIncome": {"dataType":"double","required":true},
            "fixedExpense": {"dataType":"double"},
            "monthlySaving": {"dataType":"double"},
            "spendStrategy": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GoalsResponseDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "monthlyIncome": {"dataType":"double","required":true},
            "incomeDate": {"dataType":"double"},
            "fixedExpense": {"dataType":"double"},
            "monthlySaving": {"dataType":"double"},
            "spendStrategy": {"dataType":"double","required":true},
            "shoppingBudget": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_GoalsResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"GoalsResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GoalsRequestDto": {
        "dataType": "refObject",
        "properties": {
            "monthlyIncome": {"dataType":"double","required":true},
            "incomeDate": {"dataType":"double"},
            "fixedExpense": {"dataType":"double"},
            "monthlySaving": {"dataType":"double"},
            "spendStrategy": {"dataType":"double","required":true},
            "shoppingBudget": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_GoalsResponseDto-or-null_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"dataType":"union","subSchemas":[{"ref":"GoalsResponseDto"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GoalsUpdateRequestDto": {
        "dataType": "refObject",
        "properties": {
            "monthlyIncome": {"dataType":"double"},
            "incomeDate": {"dataType":"double"},
            "fixedExpense": {"dataType":"double"},
            "monthlySaving": {"dataType":"double"},
            "shoppingBudget": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BudgetSpendResponseDto": {
        "dataType": "refObject",
        "properties": {
            "totalSpend": {"dataType":"double","required":true},
            "remainingBudget": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_BudgetSpendResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"BudgetSpendResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SpendItemType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["AUTO"]},{"dataType":"enum","enums":["MANUAL"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SpendItemDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "type": {"ref":"SpendItemType","required":true},
            "name": {"dataType":"string","required":true},
            "price": {"dataType":"double","required":true},
            "imageUrl": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SpendSummaryResponseDto": {
        "dataType": "refObject",
        "properties": {
            "averageDecisionDays": {"dataType":"double","required":true},
            "recentMonthCount": {"dataType":"double","required":true},
            "items": {"dataType":"array","array":{"dataType":"refObject","ref":"SpendItemDto"},"required":true},
            "nextCursor": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_SpendSummaryResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"SpendSummaryResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateChatResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "currentStep": {"dataType":"double","required":true},
            "createdAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateChatRequest": {
        "dataType": "refObject",
        "properties": {
            "wishItemId": {"dataType":"double","required":true},
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["AUTO"]},{"dataType":"enum","enums":["MANUAL"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChatListResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "title": {"dataType":"string","required":true},
            "createdAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChatDetailResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "wishItem": {"dataType":"nestedObjectLiteral","nestedProperties":{"price":{"dataType":"double","required":true},"name":{"dataType":"string","required":true},"id":{"dataType":"double","required":true}},"required":true},
            "answers": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"selectedOption":{"dataType":"string","required":true},"step":{"dataType":"double","required":true}}},"required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "currentStep": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "QuestionResponse": {
        "dataType": "refObject",
        "properties": {
            "step": {"dataType":"double","required":true},
            "question": {"dataType":"string","required":true},
            "options": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"label":{"dataType":"string","required":true},"id":{"dataType":"double","required":true}}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FinishResponse": {
        "dataType": "refObject",
        "properties": {
            "isFinished": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SelectOptionRequest": {
        "dataType": "refObject",
        "properties": {
            "step": {"dataType":"double","required":true},
            "selectedOptionId": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GptResultResponse": {
        "dataType": "refObject",
        "properties": {
            "decision": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["구매 추천"]},{"dataType":"enum","enums":["구매 보류"]}],"required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RegisterResponseDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_RegisterResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"RegisterResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RegisterRequestDto": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
            "nickname": {"dataType":"string","required":true},
            "goal": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_null_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"dataType":"enum","enums":[null],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmailVerifyTypeEnum": {
        "dataType": "refEnum",
        "enums": ["REGISTER","RESET_PASSWORD"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SendEmailCodeRequestDto": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "type": {"ref":"EmailVerifyTypeEnum","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VerifyEmailCodeRequestDto": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "type": {"ref":"EmailVerifyTypeEnum","required":true},
            "code": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginResponseDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "nickname": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_LoginResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"LoginResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginRequestDto": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PasswordResetConfirmDto": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "newPassword": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateNicknameResponseDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "nickname": {"dataType":"string","required":true},
            "updatedAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_UpdateNicknameResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"UpdateNicknameResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateNicknameRequestDto": {
        "dataType": "refObject",
        "properties": {
            "newNickname": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateGoalResponseDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "goal": {"dataType":"string","required":true},
            "updatedAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_UpdateGoalResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"UpdateGoalResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateGoalRequestDto": {
        "dataType": "refObject",
        "properties": {
            "newGoal": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse__isAvailable-boolean__": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"isAvailable":{"dataType":"boolean","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserProfileResponseDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "nickname": {"dataType":"string","required":true},
            "goal": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "hasPassword": {"dataType":"boolean","required":true},
            "providers": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_UserProfileResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"UserProfileResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse__isValid-boolean__": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"isValid":{"dataType":"boolean","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VerifyPasswordTypeEnum": {
        "dataType": "refEnum",
        "enums": ["DELETE_ACCOUNT","CHANGE_PASSWORD"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VerifyPasswordRequestDto": {
        "dataType": "refObject",
        "properties": {
            "password": {"dataType":"string","required":true},
            "type": {"ref":"VerifyPasswordTypeEnum","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdatePasswordResponseDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "updatedAt": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_UpdatePasswordResponseDto_": {
        "dataType": "refObject",
        "properties": {
            "resultType": {"dataType":"enum","enums":["SUCCESS"],"required":true},
            "error": {"dataType":"enum","enums":[null],"required":true},
            "data": {"ref":"UpdatePasswordResponseDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdatePasswordRequestDto": {
        "dataType": "refObject",
        "properties": {
            "newPassword": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router,opts?:{multer?:ReturnType<typeof multer>}) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################

    const upload = opts?.multer ||  multer({"limits":{"fileSize":8388608}});

    
        const argsWishlistController_addCrawlTask: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"AddCrawlTaskRequestDto"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/wishlist/crawl-tasks',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.addCrawlTask)),

            async function WishlistController_addCrawlTask(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_addCrawlTask, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'addCrawlTask',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWishlistController_listenCrawlEvents: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                jobId: {"in":"path","name":"jobId","required":true,"dataType":"string"},
        };
        app.get('/wishlist/crawl-tasks/:jobId/events',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.listenCrawlEvents)),

            async function WishlistController_listenCrawlEvents(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_listenCrawlEvents, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'listenCrawlEvents',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWishlistController_getCrawlResult: Record<string, TsoaRoute.ParameterSchema> = {
                cacheId: {"in":"path","name":"cacheId","required":true,"dataType":"string"},
        };
        app.get('/wishlist/crawl-tasks/:cacheId/result',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.getCrawlResult)),

            async function WishlistController_getCrawlResult(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_getCrawlResult, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'getCrawlResult',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWishlistController_addWishListFromCache: Record<string, TsoaRoute.ParameterSchema> = {
                cacheId: {"in":"body-prop","name":"cacheId","required":true,"dataType":"string"},
                reason: {"in":"body-prop","name":"reason","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/wishlist/items/from-cache',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.addWishListFromCache)),

            async function WishlistController_addWishListFromCache(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_addWishListFromCache, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'addWishListFromCache',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWishlistController_addWishList: Record<string, TsoaRoute.ParameterSchema> = {
                productName: {"in":"formData","name":"productName","required":true,"dataType":"string"},
                price: {"in":"formData","name":"price","required":true,"dataType":"double"},
                storeName: {"in":"formData","name":"storeName","required":true,"dataType":"string"},
                brandName: {"in":"formData","name":"brandName","required":true,"dataType":"string"},
                reason: {"in":"formData","name":"reason","required":true,"dataType":"string"},
                url: {"in":"formData","name":"url","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                file: {"in":"formData","name":"file","dataType":"file"},
        };
        app.post('/wishlist/items',
            authenticateMiddleware([{"jwt":[]}]),
            upload.fields([
                {
                    name: "file",
                    maxCount: 1
                }
            ]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.addWishList)),

            async function WishlistController_addWishList(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_addWishList, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'addWishList',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWishlistController_showWishitemDetail: Record<string, TsoaRoute.ParameterSchema> = {
                itemId: {"in":"path","name":"itemId","required":true,"dataType":"string"},
                type: {"in":"query","name":"type","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/wishlist/items/:itemId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.showWishitemDetail)),

            async function WishlistController_showWishitemDetail(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_showWishitemDetail, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'showWishitemDetail',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWishlistController_showWishitemList: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                status: {"in":"query","name":"status","required":true,"dataType":"string"},
                take: {"in":"query","name":"take","required":true,"dataType":"double"},
                cursor: {"in":"query","name":"cursor","dataType":"string"},
        };
        app.get('/wishlist/items',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.showWishitemList)),

            async function WishlistController_showWishitemList(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_showWishitemList, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'showWishitemList',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWishlistController_showWishitemFolders: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                take: {"in":"query","name":"take","required":true,"dataType":"double"},
                cursor: {"in":"query","name":"cursor","dataType":"string"},
        };
        app.get('/wishlist/folders',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.showWishitemFolders)),

            async function WishlistController_showWishitemFolders(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_showWishitemFolders, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'showWishitemFolders',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWishlistController_createWishitemFolder: Record<string, TsoaRoute.ParameterSchema> = {
                name: {"in":"body-prop","name":"name","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/wishlist/folders',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.createWishitemFolder)),

            async function WishlistController_createWishitemFolder(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_createWishitemFolder, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'createWishitemFolder',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWishlistController_deleteWishitemFolder: Record<string, TsoaRoute.ParameterSchema> = {
                folderId: {"in":"path","name":"folderId","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.delete('/wishlist/folders/:folderId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.deleteWishitemFolder)),

            async function WishlistController_deleteWishitemFolder(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_deleteWishitemFolder, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'deleteWishitemFolder',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWishlistController_changeWishitemFolderLocation: Record<string, TsoaRoute.ParameterSchema> = {
                itemId: {"in":"path","name":"itemId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"ChangeWishitemFolderLocationRequestDto"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.patch('/wishlist/items/:itemId/folder',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.changeWishitemFolderLocation)),

            async function WishlistController_changeWishitemFolderLocation(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_changeWishitemFolderLocation, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'changeWishitemFolderLocation',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWishlistController_markItemAsPurchased: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"MarkItemAsPurchasedRequestDto"},
                itemId: {"in":"path","name":"itemId","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/wishlist/items/:itemId/buy',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.markItemAsPurchased)),

            async function WishlistController_markItemAsPurchased(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_markItemAsPurchased, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'markItemAsPurchased',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWishlistController_markItemAsDropped: Record<string, TsoaRoute.ParameterSchema> = {
                itemId: {"in":"path","name":"itemId","required":true,"dataType":"string"},
                type: {"in":"body-prop","name":"type","required":true,"ref":"WishitemType"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/wishlist/items/:itemId/drop',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.markItemAsDropped)),

            async function WishlistController_markItemAsDropped(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_markItemAsDropped, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'markItemAsDropped',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWishlistController_deleteItem: Record<string, TsoaRoute.ParameterSchema> = {
                itemId: {"in":"path","name":"itemId","required":true,"dataType":"string"},
                type: {"in":"query","name":"type","required":true,"ref":"WishitemType"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.delete('/wishlist/items/:itemId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.deleteItem)),

            async function WishlistController_deleteItem(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_deleteItem, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'deleteItem',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWishlistController_showWishitemsInFolder: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                folderId: {"in":"path","name":"folderId","required":true,"dataType":"string"},
                take: {"in":"query","name":"take","required":true,"dataType":"double"},
                cursor: {"in":"query","name":"cursor","dataType":"string"},
        };
        app.get('/wishlist/folders/:folderId/items',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.showWishitemsInFolder)),

            async function WishlistController_showWishitemsInFolder(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_showWishitemsInFolder, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'showWishitemsInFolder',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWishlistController_modifyWishitemReason: Record<string, TsoaRoute.ParameterSchema> = {
                itemId: {"in":"path","name":"itemId","required":true,"dataType":"string"},
                reason: {"in":"body-prop","name":"reason","required":true,"dataType":"string"},
                type: {"in":"body-prop","name":"type","required":true,"ref":"WishitemType"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.patch('/wishlist/items/:itemId/reason',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.modifyWishitemReason)),

            async function WishlistController_modifyWishitemReason(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_modifyWishitemReason, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'modifyWishitemReason',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWishlistController_modifyWishitem: Record<string, TsoaRoute.ParameterSchema> = {
                itemId: {"in":"path","name":"itemId","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                productName: {"in":"formData","name":"productName","dataType":"string"},
                price: {"in":"formData","name":"price","dataType":"double"},
                url: {"in":"formData","name":"url","dataType":"string"},
                storeName: {"in":"formData","name":"storeName","dataType":"string"},
                file: {"in":"formData","name":"file","dataType":"file"},
        };
        app.patch('/wishlist/items/:itemId',
            authenticateMiddleware([{"jwt":[]}]),
            upload.fields([
                {
                    name: "file",
                    maxCount: 1
                }
            ]),
            ...(fetchMiddlewares<RequestHandler>(WishlistController)),
            ...(fetchMiddlewares<RequestHandler>(WishlistController.prototype.modifyWishitem)),

            async function WishlistController_modifyWishitem(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWishlistController_modifyWishitem, request, response });

                const controller = new WishlistController();

              await templateService.apiHandler({
                methodName: 'modifyWishitem',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsHistoriesController_createReview: Record<string, TsoaRoute.ParameterSchema> = {
                itemId: {"in":"path","name":"itemId","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"CreateReviewRequestDto"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/histories/items/:itemId/review',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(HistoriesController)),
            ...(fetchMiddlewares<RequestHandler>(HistoriesController.prototype.createReview)),

            async function HistoriesController_createReview(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsHistoriesController_createReview, request, response });

                const controller = new HistoriesController();

              await templateService.apiHandler({
                methodName: 'createReview',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsHistoriesController_getMyReviews: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/histories/reviews',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(HistoriesController)),
            ...(fetchMiddlewares<RequestHandler>(HistoriesController.prototype.getMyReviews)),

            async function HistoriesController_getMyReviews(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsHistoriesController_getMyReviews, request, response });

                const controller = new HistoriesController();

              await templateService.apiHandler({
                methodName: 'getMyReviews',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsHistoriesController_getMonthlyCalendar: Record<string, TsoaRoute.ParameterSchema> = {
                year: {"in":"query","name":"year","required":true,"dataType":"double"},
                month: {"in":"query","name":"month","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/histories/calendar',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(HistoriesController)),
            ...(fetchMiddlewares<RequestHandler>(HistoriesController.prototype.getMonthlyCalendar)),

            async function HistoriesController_getMonthlyCalendar(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsHistoriesController_getMonthlyCalendar, request, response });

                const controller = new HistoriesController();

              await templateService.apiHandler({
                methodName: 'getMonthlyCalendar',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsHistoriesController_getDailyHistories: Record<string, TsoaRoute.ParameterSchema> = {
                date: {"in":"query","name":"date","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/histories',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(HistoriesController)),
            ...(fetchMiddlewares<RequestHandler>(HistoriesController.prototype.getDailyHistories)),

            async function HistoriesController_getDailyHistories(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsHistoriesController_getDailyHistories, request, response });

                const controller = new HistoriesController();

              await templateService.apiHandler({
                methodName: 'getDailyHistories',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsHistoriesController_getHistoryItems: Record<string, TsoaRoute.ParameterSchema> = {
                reviewStatus: {"default":"ALL","in":"query","name":"reviewStatus","ref":"ReviewStatus"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/histories/items',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(HistoriesController)),
            ...(fetchMiddlewares<RequestHandler>(HistoriesController.prototype.getHistoryItems)),

            async function HistoriesController_getHistoryItems(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsHistoriesController_getHistoryItems, request, response });

                const controller = new HistoriesController();

              await templateService.apiHandler({
                methodName: 'getHistoryItems',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsHistoriesController_getRecentMonthReport: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/histories/report',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(HistoriesController)),
            ...(fetchMiddlewares<RequestHandler>(HistoriesController.prototype.getRecentMonthReport)),

            async function HistoriesController_getRecentMonthReport(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsHistoriesController_getRecentMonthReport, request, response });

                const controller = new HistoriesController();

              await templateService.apiHandler({
                methodName: 'getRecentMonthReport',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsHistoriesController_getAnalytics: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                metric: {"default":"time","in":"query","name":"metric","ref":"AnalyticsMetric"},
        };
        app.get('/histories/analytics',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(HistoriesController)),
            ...(fetchMiddlewares<RequestHandler>(HistoriesController.prototype.getAnalytics)),

            async function HistoriesController_getAnalytics(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsHistoriesController_getAnalytics, request, response });

                const controller = new HistoriesController();

              await templateService.apiHandler({
                methodName: 'getAnalytics',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsHistoriesController_getAiComment: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/histories/report/ai-comment',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(HistoriesController)),
            ...(fetchMiddlewares<RequestHandler>(HistoriesController.prototype.getAiComment)),

            async function HistoriesController_getAiComment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsHistoriesController_getAiComment, request, response });

                const controller = new HistoriesController();

              await templateService.apiHandler({
                methodName: 'getAiComment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGoalsController_calcShoppingBudget: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CalcShoppingBudgetRequestDto"},
        };
        app.post('/goals/budget/calculate',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(GoalsController)),
            ...(fetchMiddlewares<RequestHandler>(GoalsController.prototype.calcShoppingBudget)),

            async function GoalsController_calcShoppingBudget(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGoalsController_calcShoppingBudget, request, response });

                const controller = new GoalsController();

              await templateService.apiHandler({
                methodName: 'calcShoppingBudget',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGoalsController_createTargetBudget: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"GoalsRequestDto"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/goals/budget',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(GoalsController)),
            ...(fetchMiddlewares<RequestHandler>(GoalsController.prototype.createTargetBudget)),

            async function GoalsController_createTargetBudget(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGoalsController_createTargetBudget, request, response });

                const controller = new GoalsController();

              await templateService.apiHandler({
                methodName: 'createTargetBudget',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGoalsController_getTargetBudget: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/goals/budget',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(GoalsController)),
            ...(fetchMiddlewares<RequestHandler>(GoalsController.prototype.getTargetBudget)),

            async function GoalsController_getTargetBudget(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGoalsController_getTargetBudget, request, response });

                const controller = new GoalsController();

              await templateService.apiHandler({
                methodName: 'getTargetBudget',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGoalsController_updateTargetBudget: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"GoalsUpdateRequestDto"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.patch('/goals/budget',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(GoalsController)),
            ...(fetchMiddlewares<RequestHandler>(GoalsController.prototype.updateTargetBudget)),

            async function GoalsController_updateTargetBudget(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGoalsController_updateTargetBudget, request, response });

                const controller = new GoalsController();

              await templateService.apiHandler({
                methodName: 'updateTargetBudget',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGoalsController_getBudgetSpend: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/goals/spend',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(GoalsController)),
            ...(fetchMiddlewares<RequestHandler>(GoalsController.prototype.getBudgetSpend)),

            async function GoalsController_getBudgetSpend(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGoalsController_getBudgetSpend, request, response });

                const controller = new GoalsController();

              await templateService.apiHandler({
                methodName: 'getBudgetSpend',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGoalsController_getSatisfiedSpend: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                cursor: {"in":"query","name":"cursor","dataType":"string"},
        };
        app.get('/goals/spend/satisfied',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(GoalsController)),
            ...(fetchMiddlewares<RequestHandler>(GoalsController.prototype.getSatisfiedSpend)),

            async function GoalsController_getSatisfiedSpend(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGoalsController_getSatisfiedSpend, request, response });

                const controller = new GoalsController();

              await templateService.apiHandler({
                methodName: 'getSatisfiedSpend',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGoalsController_getRegretSpend: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                cursor: {"in":"query","name":"cursor","dataType":"string"},
        };
        app.get('/goals/spend/regret',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(GoalsController)),
            ...(fetchMiddlewares<RequestHandler>(GoalsController.prototype.getRegretSpend)),

            async function GoalsController_getRegretSpend(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGoalsController_getRegretSpend, request, response });

                const controller = new GoalsController();

              await templateService.apiHandler({
                methodName: 'getRegretSpend',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsChatsController_createChat: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateChatRequest"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/chats',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ChatsController)),
            ...(fetchMiddlewares<RequestHandler>(ChatsController.prototype.createChat)),

            async function ChatsController_createChat(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsChatsController_createChat, request, response });

                const controller = new ChatsController();

              await templateService.apiHandler({
                methodName: 'createChat',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsChatsController_getChats: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/chats',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ChatsController)),
            ...(fetchMiddlewares<RequestHandler>(ChatsController.prototype.getChats)),

            async function ChatsController_getChats(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsChatsController_getChats, request, response });

                const controller = new ChatsController();

              await templateService.apiHandler({
                methodName: 'getChats',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsChatsController_getChatDetail: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/chats/:id',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ChatsController)),
            ...(fetchMiddlewares<RequestHandler>(ChatsController.prototype.getChatDetail)),

            async function ChatsController_getChatDetail(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsChatsController_getChatDetail, request, response });

                const controller = new ChatsController();

              await templateService.apiHandler({
                methodName: 'getChatDetail',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsChatsController_getQuestion: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/chats/:id/question',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ChatsController)),
            ...(fetchMiddlewares<RequestHandler>(ChatsController.prototype.getQuestion)),

            async function ChatsController_getQuestion(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsChatsController_getQuestion, request, response });

                const controller = new ChatsController();

              await templateService.apiHandler({
                methodName: 'getQuestion',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsChatsController_selectOption: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"SelectOptionRequest"},
        };
        app.post('/chats/:id/select',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ChatsController)),
            ...(fetchMiddlewares<RequestHandler>(ChatsController.prototype.selectOption)),

            async function ChatsController_selectOption(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsChatsController_selectOption, request, response });

                const controller = new ChatsController();

              await templateService.apiHandler({
                methodName: 'selectOption',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsChatsController_deleteChat: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/chats/:id',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ChatsController)),
            ...(fetchMiddlewares<RequestHandler>(ChatsController.prototype.deleteChat)),

            async function ChatsController_deleteChat(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsChatsController_deleteChat, request, response });

                const controller = new ChatsController();

              await templateService.apiHandler({
                methodName: 'deleteChat',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsChatsController_resultChat: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/chats/:id/result',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ChatsController)),
            ...(fetchMiddlewares<RequestHandler>(ChatsController.prototype.resultChat)),

            async function ChatsController_resultChat(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsChatsController_resultChat, request, response });

                const controller = new ChatsController();

              await templateService.apiHandler({
                methodName: 'resultChat',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_register: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"RegisterRequestDto"},
        };
        app.post('/auth/register',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.register)),

            async function AuthController_register(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_register, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'register',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_sendEmailVerificationCode: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"SendEmailCodeRequestDto"},
        };
        app.post('/auth/email/send-code',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.sendEmailVerificationCode)),

            async function AuthController_sendEmailVerificationCode(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_sendEmailVerificationCode, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'sendEmailVerificationCode',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_verifyEmailVerificationCode: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"VerifyEmailCodeRequestDto"},
        };
        app.post('/auth/email/verify-code',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.verifyEmailVerificationCode)),

            async function AuthController_verifyEmailVerificationCode(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_verifyEmailVerificationCode, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'verifyEmailVerificationCode',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_login: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"LoginRequestDto"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/auth/login',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.login)),

            async function AuthController_login(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_login, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_refresh: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/auth/refresh',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.refresh)),

            async function AuthController_refresh(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_refresh, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'refresh',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_resetPassword: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"PasswordResetConfirmDto"},
        };
        app.post('/auth/account-recovery/password',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.resetPassword)),

            async function AuthController_resetPassword(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_resetPassword, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'resetPassword',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_initiateGoogleLogin: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/auth/google-login',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.initiateGoogleLogin)),

            async function AuthController_initiateGoogleLogin(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_initiateGoogleLogin, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'initiateGoogleLogin',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 302,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_googleCallback: Record<string, TsoaRoute.ParameterSchema> = {
                code: {"in":"query","name":"code","required":true,"dataType":"string"},
                state: {"in":"query","name":"state","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/auth/oauth/google/callback',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.googleCallback)),

            async function AuthController_googleCallback(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_googleCallback, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'googleCallback',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 302,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_initiateKakaoLogin: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/auth/kakao-login',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.initiateKakaoLogin)),

            async function AuthController_initiateKakaoLogin(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_initiateKakaoLogin, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'initiateKakaoLogin',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 302,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_kakaoCallback: Record<string, TsoaRoute.ParameterSchema> = {
                code: {"in":"query","name":"code","required":true,"dataType":"string"},
                state: {"in":"query","name":"state","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/auth/oauth/kakao/callback',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.kakaoCallback)),

            async function AuthController_kakaoCallback(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_kakaoCallback, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'kakaoCallback',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 302,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_logout: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/auth/logout',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.logout)),

            async function AuthController_logout(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_logout, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'logout',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_deleteAccount: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.delete('/auth/account',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.deleteAccount)),

            async function AuthController_deleteAccount(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_deleteAccount, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'deleteAccount',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_updateNickname: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"UpdateNicknameRequestDto"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.patch('/auth/profile/nickname',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.updateNickname)),

            async function AuthController_updateNickname(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_updateNickname, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'updateNickname',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_updateGoal: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"UpdateGoalRequestDto"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.patch('/auth/profile/goal',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.updateGoal)),

            async function AuthController_updateGoal(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_updateGoal, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'updateGoal',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_checkNicknameDuplicate: Record<string, TsoaRoute.ParameterSchema> = {
                nickname: {"in":"query","name":"nickname","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/auth/nickname/duplicate',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.checkNicknameDuplicate)),

            async function AuthController_checkNicknameDuplicate(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_checkNicknameDuplicate, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'checkNicknameDuplicate',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_getMyProfile: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/auth/me',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.getMyProfile)),

            async function AuthController_getMyProfile(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_getMyProfile, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'getMyProfile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_verifyPassword: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"VerifyPasswordRequestDto"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/auth/verify-password',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.verifyPassword)),

            async function AuthController_verifyPassword(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_verifyPassword, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'verifyPassword',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_updatePassword: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"UpdatePasswordRequestDto"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.patch('/auth/password',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.updatePassword)),

            async function AuthController_updatePassword(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_updatePassword, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'updatePassword',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return async function runAuthenticationMiddleware(request: any, response: any, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts: any[] = [];
            const pushAndRethrow = (error: any) => {
                failedAttempts.push(error);
                throw error;
            };

            const secMethodOrPromises: Promise<any>[] = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        secMethodAndPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }

                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                } else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }
                }
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            try {
                request['user'] = await Promise.any(secMethodOrPromises);

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }

                next();
            }
            catch(err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next(error);
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
