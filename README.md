## 🔐 Authentication APIs

> Use **djoser** or **dj-rest-auth** for faster integration (or custom views).

| Method | Endpoint               | Description                          |
| ------ | ---------------------- | ------------------------------------ |
| POST   | `/api/register/`       | Register new user (email & password) |
| POST   | `/api/login/`          | Login user and return token          |
| POST   | `/api/logout/`         | Logout user                          |
| GET    | `/api/profile/`        | Get current user profile & points    |
| PUT    | `/api/profile/update/` | Update user profile info             |

---

## 🏠 Landing Page APIs

> Public access / visitor previews

| Method | Endpoint                       | Description                              |
| ------ | ------------------------------ | ---------------------------------------- |
| GET    | `/api/items/featured/`         | Get featured items for homepage carousel |
| GET    | `/api/items/`                  | List all available items                 |
| GET    | `/api/items/search/?query=...` | Search items by tags, title, etc.        |

---

## 👤 User Dashboard APIs

| Method | Endpoint                | Description                                |
| ------ | ----------------------- | ------------------------------------------ |
| GET    | `/api/dashboard/`       | Get user details, point balance, and stats |
| GET    | `/api/items/my/`        | List items uploaded by current user        |
| GET    | `/api/swaps/`           | List all swaps involving current user      |
| GET    | `/api/swaps/completed/` | List completed swaps                       |

---

## 👕 Item APIs

| Method | Endpoint           | Description                              |
| ------ | ------------------ | ---------------------------------------- |
| POST   | `/api/items/`      | Upload new item (with images & metadata) |
| GET    | `/api/items/<id>/` | Get item detail (gallery, description)   |
| PUT    | `/api/items/<id>/` | Update item (owner only)                 |
| DELETE | `/api/items/<id>/` | Delete item (owner only)                 |

---

## 🔁 Swap & Redemption APIs

| Method | Endpoint                    | Description                       |
| ------ | --------------------------- | --------------------------------- |
| POST   | `/api/swaps/request/`       | Request to swap an item           |
| POST   | `/api/swaps/redeem/`        | Redeem an item via points         |
| GET    | `/api/swaps/<id>/`          | View swap request (status, users) |
| PUT    | `/api/swaps/<id>/update/`   | Accept or reject swap             |
| POST   | `/api/swaps/<id>/complete/` | Mark swap as completed            |

---

## 🛡️ Admin APIs

> Accessible to staff/admin users

| Method | Endpoint                         | Description                  |
| ------ | -------------------------------- | ---------------------------- |
| GET    | `/api/admin/items/pending/`      | View items awaiting approval |
| POST   | `/api/admin/items/<id>/approve/` | Approve item listing         |
| POST   | `/api/admin/items/<id>/reject/`  | Reject item listing          |
| DELETE | `/api/admin/items/<id>/remove/`  | Force-remove any item        |

---

## 📁 Optional / Miscellaneous APIs

| Method | Endpoint           | Description                    |
| ------ | ------------------ | ------------------------------ |
| GET    | `/api/categories/` | List all item categories/types |
| GET    | `/api/tags/`       | List popular tags              |
| GET    | `/api/users/<id>/` | Get public uploader info       |
