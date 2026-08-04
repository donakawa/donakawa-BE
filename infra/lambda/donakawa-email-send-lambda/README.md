# donakawa-email-send-lambda

Email verification sender Lambda for Donakawa authentication.

## Runtime

Use Node.js 20 or newer.

## Handler

```text
index.handler
```

## Environment variables

```text
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_SECURE=false
MAIL_FROM="Donakawa" <no-reply@example.com>
EMAIL_CODE_TTL_MINUTES=5
```

`SMTP_SECURE`, `MAIL_FROM`, and `EMAIL_CODE_TTL_MINUTES` are optional.

## Request

```json
{
  "to": "user@example.com",
  "code": "123456",
  "type": "REGISTER",
  "ttlMinutes": 5
}
```

`type` can be `REGISTER` or `RESET_PASSWORD`.

## Response

```json
{
  "statusCode": 200,
  "headers": {
    "content-type": "application/json"
  },
  "isBase64Encoded": false,
  "body": "{\"message\":\"email sent\",\"messageId\":\"...\"}"
}
```
