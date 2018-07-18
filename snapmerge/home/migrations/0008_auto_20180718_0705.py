# Generated by Django 2.0.1 on 2018-07-18 07:05

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0007_auto_20180717_1344'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, verbose_name='Id'),
        ),
        migrations.AlterField(
            model_name='project',
            name='password',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='Password'),
        ),
    ]