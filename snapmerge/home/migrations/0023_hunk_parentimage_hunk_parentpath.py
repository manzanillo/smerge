# Generated by Django 5.0 on 2024-02-04 16:25

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0022_alter_hunk_mergeconflict_alter_mergeconflict_left_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='hunk',
            name='parentImage',
            field=models.FileField(blank=True, upload_to='', validators=[django.core.validators.FileExtensionValidator(['base64', 'BASE64'])], verbose_name='parentImageFile'),
        ),
        migrations.AddField(
            model_name='hunk',
            name='parentPath',
            field=models.CharField(max_length=255, null=True, verbose_name='parentPath'),
        ),
    ]
