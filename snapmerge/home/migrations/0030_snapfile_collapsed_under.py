# Generated by Django 5.0 on 2024-04-03 17:58

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0029_hash_passwords'),
    ]

    operations = [
        migrations.AddField(
            model_name='snapfile',
            name='collapsed_under',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='collapsed_above', to='home.snapfile'),
        ),
    ]
