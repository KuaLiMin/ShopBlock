# Generated by Django 5.1.1 on 2024-10-22 05:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0026_user_biography'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='biography',
            field=models.TextField(blank=True),
        ),
    ]