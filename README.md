<p align="center">
  <img src="https://raw.githubusercontent.com/ryu-ryuk/re-wear/main/backend/static/logo/logo.png" alt="ReWear Logo" width="300"/>
</p>

<h1 align="center">👚 ReWear – Community Clothing Exchange</h1>


## 🧩 Problem Statement

ReWear is a web-based platform designed to promote sustainable fashion by enabling users to **exchange unused clothing** through **direct swaps** or a **point-based redemption system**. It encourages people to reuse wearable garments instead of discarding them, helping reduce textile waste and promote conscious consumption.

The platform provides a seamless user experience with features like item listings, swap requests, points management, and admin moderation — all tailored to create a trusted and vibrant clothing exchange community.

---

## 👥 Team Members

- **Arjith A R**
- **Alok**
- **Darunesh**

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


## Project Structure

```
backend/
├── admin_panel/            # custom admin configs
├── items/                  # item upload, listing, redemption
├── swaps/                  # swap request/response logic
├── users/                  # user model, auth, profiles
├── rewear/                 # django project structure
├── manage.py               # entry point for DJANOGOGOOG
├── Dockerfile              # backend image config
├── docker-compose.yml      # backend and db ahh
├── Makefile                # make run
├── requirements.txt        # requirements
└── .env                    # env
```
