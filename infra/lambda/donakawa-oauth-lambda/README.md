# donakawa-oauth-lambda

OAuth external API Lambda for Donakawa authentication.

## Runtime

Use Node.js 20 or newer.

## Handler

```text
index.handler
```

## Environment variables

```text
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=...
KAKAO_CLIENT_ID=...
KAKAO_REDIRECT_URI=...
KAKAO_CLIENT_SECRET=...
KAKAO_ADMIN_KEY=...
```

`KAKAO_CLIENT_SECRET` and `KAKAO_ADMIN_KEY` are optional.

## Requests

Google user info:

```json
{
  "provider": "GOOGLE",
  "action": "GET_USER_INFO",
  "code": "authorization-code"
}
```

Kakao user info:

```json
{
  "provider": "KAKAO",
  "action": "GET_USER_INFO",
  "code": "authorization-code"
}
```

Kakao unlink:

```json
{
  "provider": "KAKAO",
  "action": "UNLINK_USER",
  "kakaoUid": "123456"
}
```
