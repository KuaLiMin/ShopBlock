# Generated by Django 5.1.1 on 2024-09-27 15:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_rename_image_listingphoto_image_url'),
    ]

    operations = [
        migrations.AlterField(
            model_name='listingphoto',
            name='image_url',
            field=models.ImageField(upload_to='media/'),
        ),
    ]
