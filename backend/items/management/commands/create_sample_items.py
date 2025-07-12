"""
Management command to create sample items for frontend development and demo.

Usage: python manage.py create_sample_items
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from items.models import Item
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample items for frontend development and demo'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count', 
            type=int, 
            default=20, 
            help='Number of sample items to create'
        )

    def handle(self, *args, **options):
        count = options['count']
        
        # Create a demo user if none exists
        demo_user, created = User.objects.get_or_create(
            username='demo_user',
            defaults={
                'email': 'demo@rewear.com',
                'first_name': 'Demo',
                'last_name': 'User',
                'points': 50
            }
        )
        
        if created:
            demo_user.set_password('demo123')
            demo_user.save()
            self.stdout.write(f'Created demo user: {demo_user.username}')

        # Sample data for realistic items
        sample_items = [
            {
                'title': 'Vintage Levi\'s Denim Jacket',
                'description': 'Classic vintage Levi\'s jacket in excellent condition. Perfect for layering!',
                'category': 'outerwear',
                'size': 'M',
                'condition': 'excellent',
                'brand': 'Levi\'s',
                'color': 'Blue',
                'tags': 'vintage, denim, classic, casual',
                'point_value': 25
            },
            {
                'title': 'Floral Summer Dress',
                'description': 'Beautiful floral print dress, perfect for summer occasions.',
                'category': 'dresses',
                'size': 'S',
                'condition': 'good',
                'brand': 'Zara',
                'color': 'Pink',
                'tags': 'floral, summer, feminine, casual',
                'point_value': 15
            },
            {
                'title': 'Nike Air Max Sneakers',
                'description': 'Comfortable running shoes in great condition. Size 9.',
                'category': 'shoes',
                'size': '9',
                'condition': 'good',
                'brand': 'Nike',
                'color': 'White',
                'tags': 'athletic, comfortable, running, sneakers',
                'point_value': 30
            },
            {
                'title': 'Cashmere Scarf',
                'description': 'Luxurious cashmere scarf, barely worn. Super soft and warm.',
                'category': 'accessories',
                'size': 'One Size',
                'condition': 'excellent',
                'brand': 'Burberry',
                'color': 'Beige',
                'tags': 'luxury, warm, cashmere, winter',
                'point_value': 40
            },
            {
                'title': 'High-Waisted Black Jeans',
                'description': 'Trendy high-waisted jeans that are super flattering.',
                'category': 'bottoms',
                'size': '28',
                'condition': 'good',
                'brand': 'Urban Outfitters',
                'color': 'Black',
                'tags': 'trendy, high-waisted, flattering, versatile',
                'point_value': 20
            },
            {
                'title': 'Oversized Knit Sweater',
                'description': 'Cozy oversized sweater perfect for fall and winter.',
                'category': 'tops',
                'size': 'L',
                'condition': 'good',
                'brand': 'H&M',
                'color': 'Cream',
                'tags': 'cozy, oversized, knit, fall, winter',
                'point_value': 18
            },
            {
                'title': 'Leather Crossbody Bag',
                'description': 'Genuine leather crossbody bag with adjustable strap.',
                'category': 'bags',
                'size': 'Small',
                'condition': 'excellent',
                'brand': 'Coach',
                'color': 'Brown',
                'tags': 'leather, crossbody, designer, versatile',
                'point_value': 35
            },
            {
                'title': 'Yoga Leggings',
                'description': 'High-performance yoga leggings with moisture-wicking fabric.',
                'category': 'activewear',
                'size': 'M',
                'condition': 'excellent',
                'brand': 'Lululemon',
                'color': 'Black',
                'tags': 'yoga, athletic, comfortable, stretchy',
                'point_value': 28
            }
        ]

        created_count = 0
        
        for i in range(count):
            # Cycle through sample items
            item_data = sample_items[i % len(sample_items)]
            
            # Add some variation to titles and points
            title = f"{item_data['title']} #{i+1}" if i >= len(sample_items) else item_data['title']
            point_value = item_data['point_value'] + random.randint(-5, 5)
            point_value = max(5, min(50, point_value))  # Keep within reasonable range
            
            # Create the item
            item = Item.objects.create(
                owner=demo_user,
                title=title,
                description=item_data['description'],
                category=item_data['category'],
                size=item_data['size'],
                condition=item_data['condition'],
                brand=item_data['brand'],
                color=item_data['color'],
                tags=item_data['tags'],
                point_value=point_value,
                is_approved=True,  # Auto-approve for demo
                is_featured=random.choice([True, False, False, False]),  # 25% chance of being featured
                view_count=random.randint(0, 100),
                like_count=random.randint(0, 20)
            )
            
            created_count += 1
            
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} sample items!')
        )
        self.stdout.write(
            f'Demo user credentials: username=demo_user, password=demo123'
        )
