# Generated by Django 5.2.4 on 2025-07-12 06:29

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('items', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SwapRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected'), ('completed', 'Completed')], default='pending', max_length=20)),
                ('message', models.TextField(blank=True, help_text='Optional message to the item owner')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('offered_item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='swap_requests_offered', to='items.item')),
                ('requested_item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='swap_requests_received', to='items.item')),
                ('requester', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='swap_requests_made', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('requester', 'requested_item', 'offered_item')},
            },
        ),
    ]
