# donakawa-external-fetch-lambda

External image fetch Lambda for the wishlist image proxy.

## Runtime

Use Node.js 20 or newer.

## Handler

```text
index.handler
```

## Request

```json
{
  "url": "https://example.com/image.jpg",
  "responseType": "base64",
  "timeoutMs": 5000,
  "maxBytes": 6291456
}
```

## Response

```json
{
  "statusCode": 200,
  "headers": {
    "content-type": "image/jpeg",
    "content-length": "12345"
  },
  "isBase64Encoded": true,
  "body": "..."
}
```
