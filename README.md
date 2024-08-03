# AID ME BACKEND

## API URL

```
https://aid-me-backend.onrender.com
```

## Different Routes
- `/camps`
- `/people`
- `/families`
- `/donations`
- `/auth/token`

## Token
Generate a `token` by going to `auth/token` and passing `{"username":"admin", "password": "admin"}` to the body. Add the `token` in the header as `authorization: [GENERATED_TOKEN]`.


*as the `frontend` is under construction, it is recommended to use Insomnia or any other API client for requests.*
