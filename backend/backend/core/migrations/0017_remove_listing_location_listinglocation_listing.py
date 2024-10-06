# Generated by Django 5.1.1 on 2024-10-06 14:14

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0016_rename_listing_notes_listinglocation_notes_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='listing',
            name='location',
        ),
        migrations.AddField(
            model_name='listinglocation',
            name='listing',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='locations', to='core.listing'),
            preserve_default=False,
        ),
    ]
