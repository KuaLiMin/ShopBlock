# Generated by Django 5.1.1 on 2024-09-27 15:10

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_alter_user_password'),
    ]

    operations = [
        migrations.RenameField(
            model_name='listingphoto',
            old_name='image',
            new_name='image_url',
        ),
    ]
