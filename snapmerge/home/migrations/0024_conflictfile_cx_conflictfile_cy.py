# Generated by Django 5.0 on 2024-02-04 19:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0023_hunk_parentimage_hunk_parentpath'),
    ]

    operations = [
        migrations.AddField(
            model_name='conflictfile',
            name='cx',
            field=models.IntegerField(null=True, verbose_name='cx'),
        ),
        migrations.AddField(
            model_name='conflictfile',
            name='cy',
            field=models.IntegerField(null=True, verbose_name='cy'),
        ),
    ]
