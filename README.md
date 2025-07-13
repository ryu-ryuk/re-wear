<div align="center">

<img src="backend/static/logo/logo.png" alt="ReWear Logo" width="300"/>

# ReWear – Sustainable Fashion Exchange Platform

![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-a6e3a1?style=for-the-badge)
  

*A community-driven platform for sustainable fashion through clothing swaps and point-based redemption*

</div>

<div align="center">
  
  ## ~ Demo Video ~

  https://github.com/user-attachments/assets/f52e7b41-483a-4553-9a24-7cd14b5d5e74

## Problem Statement

ReWear addresses the growing issue of textile waste by creating a platform where users can **exchange unused clothing** through direct swaps or a point-based redemption system. The platform promotes sustainable fashion practices, reduces clothing waste, and builds a community around conscious consumption.

---


## Platform Overview

```mermaid
graph TB
    A[User Registration] --> B[100 Welcome Points]
    B --> C[Browse Items]
    C --> D{Exchange Method}
    D -->|Direct Swap| E[Swap Request]
    D -->|Use Points| F[Point Redemption]
    E --> G[Owner Approval]
    G -->|Accepted| H[Coordinate Exchange]
    G -->|Rejected| I[Try Again]
    F --> J[Instant Acquisition]
    H --> K[Both Users Earn 5 Points]
    J --> L[Points Deducted]
    K --> M[Successful Exchange]
    L --> M
```

## Team Members

- **Arjith A R** - Frontend
- **Alok** - Backend && Frontend
- **Darunesh** - Backend

## Features Implemented

### Core Features
- **User Authentication** - JWT-based registration and login with welcome bonus
- **Item Management** - Upload, browse, search, and manage clothing items
- **Swap System** - Direct item-to-item exchanges with negotiation
- **Points System** - Earn and spend points for instant redemptions
- **Search & Filtering** - Advanced search by category, condition, size, color
- **User Dashboard** - Comprehensive activity tracking and statistics
- **Engagement Features** - Like items, view counters, activity feeds
- **Reporting System** - Community-driven content moderation

### Technical Features
- **RESTful API** - Complete backend API with Django REST Framework
- **Image Handling** - Multi-image upload with optimization
- **Admin Panel** - Custom Django admin for platform management
- **Responsive Design** - Modern UI with Tailwind CSS and Radix UI
- **Real-time Updates** - Activity feeds and notification system
- **Data Validation** - Comprehensive input validation and error handling

## Tech Stack

### Backend
- **Django 5.2.4** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Primary database
- **JWT Authentication** - Secure token-based auth
- **Pillow** - Image processing
- **Docker** - Containerization

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component library
- **React Hook Form** - Form management
- **Zod** - Schema validation

## Quick Start

### Using Docker (Recommended)
```bash
# Clone the repository
git clone https://github.com/ryu-ryuk/re-wear.git
cd re-wear

# Start the backend services
cd backend
make build
make up

# Start the frontend
cd ../frontend
bun install
bun dev
```

### Manual Setup

#### Backend
```bash
cd backend
# Install dependencies with uv
uv sync

# Run migrations
python manage.py migrate

# Create superuser
make createsuperuser

# Start development server
make build && make up
```

#### Frontend
```bash
cd frontend
# Install dependencies
bun i

# Start development server
bun dev
```

## API Documentation

Complete API documentation is available at:

- **Interactive Docs**: [API.md](./API.md)
- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/

### Key Endpoints

#### Authentication
- `POST /api/users/register/` - Register with welcome bonus
- `POST /api/users/login/` - JWT token authentication

#### Items
- `GET /api/items/` - Browse items with filtering
- `POST /api/items/` - Upload new items
- `GET /api/items/featured/` - Featured items carousel
- `POST /api/items/{id}/like/` - Like/unlike items

#### Swaps
- `POST /api/swaps/` - Create swap requests
- `POST /api/swaps/{id}/accept/` - Accept swap requests
- `POST /api/swaps/redeem/` - Redeem items with points

#### User Management
- `GET /api/users/me/` - User profile
- `GET /api/users/dashboard/` - Dashboard analytics
- `GET /api/users/liked_items/` - User's favorite items

## Application Flow

```mermaid
graph LR
    A[Browse Items] --> B{User Action}
    B -->|Like Item| C[Add to Favorites]
    B -->|Request Swap| D[Create Swap Request]
    B -->|Redeem Points| E[Point Redemption]
    D --> F[Owner Notification]
    F --> G{Owner Decision}
    G -->|Accept| H[Arrange Exchange]
    G -->|Reject| I[Request Denied]
    H --> J[Complete Swap]
    J --> K[Both Users +5 Points]
    E --> L[Item Transferred]
    C --> M[Saved for Later]
```

## Project Structure

```
re-wear/
├── backend/                    # Django REST API
│   ├── rewear/                # Project settings
│   ├── users/                 # User management & auth
│   ├── items/                 # Item management
│   ├── swaps/                 # Swap system
│   ├── admin_panel/           # Custom admin interface
│   ├── media/                 # User uploaded files
│   ├── static/                # Static assets
│   ├── Dockerfile             # Backend containerization
│   ├── docker-compose.yml     # Multi-service setup
│   ├── Makefile              # Development commands
│   └── test_*.py             # Comprehensive test suite
│
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/              # App router pages
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utilities and config
│   ├── public/               # Static assets
│   └── package.json          # Dependencies
│
├── API.md                    # Complete API documentation
└── README.md                 # This file
```

## Development Commands

### Backend
```bash
# Using Makefile
make up          # Start all services with Docker
make down        # Stop all services
make build       # Rebuild containers
make logs        # View logs
make shell       # Access Django shell
make test        # Run test suite

# Manual commands
python manage.py runserver              # Start development server
python manage.py migrate                # Apply database migrations
python manage.py createsuperuser        # Create admin user
python manage.py collectstatic          # Collect static files
```

### Frontend
```bash
bun dev          # Start development server
bun build        # Build for production
bun start        # Start production server
bun lint         # Run ESLint
```

## Testing

The project includes comprehensive test suites:

- `test_api.py` - Basic API functionality
- `test_comprehensive_swaps.py` - Complete swap flow testing
- `test_docker_image_upload.py` - Image upload functionality
- `test_docker_redemption.py` - Points redemption system
- `test_error_responses.py` - Error handling validation

Run tests:
```bash
cd backend
python test_comprehensive_swaps.py
```

## Database Schema

```mermaid
erDiagram
    User ||--o{ Item : owns
    User ||--o{ SwapRequest : creates
    User ||--o{ ItemLike : likes
    User ||--o{ ItemReport : reports
    Item ||--o{ ItemImage : has
    Item ||--o{ SwapRequest : "requested_item"
    Item ||--o{ SwapRequest : "offered_item"
    Item ||--o{ ItemLike : receives
    Item ||--o{ ItemReport : "reported_item"
    
    User {
        int id PK
        string username
        string email
        int points
        string location
        bool is_private
    }
    
    Item {
        int id PK
        int owner_id FK
        string title
        text description
        string category
        string condition
        int point_value
        string status
        bool is_approved
        bool is_featured
    }
    
    SwapRequest {
        int id PK
        int requester_id FK
        int requested_item_id FK
        int offered_item_id FK
        string status
        text message
    }
```

## Environment Variables

### Backend (.env)
```bash
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/rewear
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Production Deployment

### Backend (Django)
1. Set `DEBUG=False` in production
2. Configure proper `ALLOWED_HOSTS`
3. Use PostgreSQL database
4. Set up proper media file serving
5. Configure CORS for frontend domain

### Frontend (Next.js)
1. Update `NEXT_PUBLIC_API_URL` to production API
2. Build and deploy using Vercel, Netlify, or similar
3. Ensure proper environment variables are set

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Known Limitations

- **Admin Panel**: Basic implementation, could use more sophisticated moderation tools
- **Real-time Notifications**: Currently using polling, could implement WebSocket for real-time updates
- **Payment Integration**: Points system is internal, no monetary transactions
- **Mobile App**: Web-only platform, native mobile app not developed
- **Advanced Search**: Basic search implemented, could add ML-based recommendations

## Future Enhancements

- Real-time chat between swap partners
- Machine learning-based item recommendations
- Integration with shipping services for remote swaps
- Mobile application for iOS and Android
- Advanced analytics dashboard for users
- Social features (following users, sharing collections)
- Integration with sustainable fashion brands

## License

This project was developed for a hackathon and is available under the MIT License.

---

<div align="center">

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)
![Sustainable Fashion](https://img.shields.io/badge/Sustainable-Fashion-green.svg)

</div>
