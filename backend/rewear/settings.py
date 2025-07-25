from pathlib import Path
import os
from django.utils.translation import gettext_lazy as _
from django.templatetags.static import static
from datetime import timedelta
from dotenv import load_dotenv
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
DEBUG = os.getenv("DJANGO_DEBUG", "False") == "True"

ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "").split(",")


# apps
INSTALLED_APPS = [
    "unfold",
    "unfold.contrib.filters", 
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # third-party
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'djoser',
    'drf_yasg',
    'corsheaders',

    # local
    'users',
    'items',
    'swaps',
    'admin_panel',
]


# middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'rewear.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


WSGI_APPLICATION = 'rewear.wsgi.application'
ASGI_APPLICATION = 'rewear.asgi.application'


# database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB"),
        "USER": os.getenv("POSTGRES_USER"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
        "HOST": os.getenv("POSTGRES_HOST", "localhost"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

AUTH_USER_MODEL = "users.User"

# password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# i18n
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# static / media
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
# STATICFILES_DIRS = [
#     BASE_DIR / "static",
# ]
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# cors
CORS_ALLOW_ALL_ORIGINS = True

# rest framework (can be expanded later)
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}

# jwt authentication
# simple jwt settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}


# djoser settings
DJOSER = {
    'LOGIN_FIELD': 'username',
    'USER_CREATE_PASSWORD_RETYPE': False,
    'SERIALIZERS': {
        'user_create': 'djoser.serializers.UserCreateSerializer',
        'user': 'djoser.serializers.UserSerializer',
        'current_user': 'djoser.serializers.UserSerializer',
    },
    'PERMISSIONS': {
        'user': ['rest_framework.permissions.IsAuthenticated'],
        'user_list': ['rest_framework.permissions.IsAdminUser'],
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ========================================
# REWEAR PLATFORM SETTINGS
# ========================================

# Featured Items Configuration - Admin Configurable
FEATURED_ITEMS_DEFAULT_COUNT = int(os.getenv("FEATURED_ITEMS_DEFAULT_COUNT", "6"))
FEATURED_ITEMS_MAX_COUNT = int(os.getenv("FEATURED_ITEMS_MAX_COUNT", "20"))

UNFOLD = {
    "SITE_TITLE": _("ReWear Admin"),
    "SITE_HEADER": _("ReWear Admin Panel"),
    "SITE_URL": "/",
    "SITE_ICON": {
        "light": lambda request: static("logo/logo.png"),
        "dark": lambda request: static("logo/logo.png"),
    },
    "SITE_LOGO": {
        "light": lambda request: static("logo/logo.png"),
        "dark": lambda request: static("logo/logo.png"),
    },
    "SITE_SYMBOL": "recycling",  # google material icon name
    "LOGIN": {
        "image": lambda request: static("logo/rewear_bg.jpg"),  # optional background image
    },
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": False,
    "SHOW_BACK_BUTTON": True,
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": True,
        "navigation": [
            {
                "title": _("Main"),
                "items": [
                    {
                        "title": "Users",
                        "icon": "person",
                        "model": "users.User",
                        "app": "users"
                    },
                    {
                        "title": "Items",
                        "icon": "inventory",
                        "model": "items.Item",
                        "app": "items"
                    },
                    {
                        "title": "Swaps",
                        "icon": "sync_alt",
                        "model": "swaps.SwapRequest",
                        "app": "swaps"
                    },
                    {
                        "title": "Platform Settings",
                        "icon": "settings",
                        "model": "items.PlatformConfig",
                        "app": "items"
                    },
                ],
            },
        ],
    },
    "COLORS": {
        "primary": {
            "500": "147 97 253",  # violet/catppuccin-inspired accent
        },
    },
    "BORDER_RADIUS": "6px",
}
