# Generated by Django 5.1.1 on 2024-10-06 10:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0015_listinglocation_remove_listing_latitude_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='listinglocation',
            old_name='listing_notes',
            new_name='notes',
        ),
        migrations.RenameField(
            model_name='listinglocation',
            old_name='listing_query',
            new_name='query',
        ),
    ]