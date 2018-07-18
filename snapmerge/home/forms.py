from django import forms
from django.utils.translation import gettext_lazy as _

class OpenProjectForm(forms.Form):
    pin = forms.CharField(label=_('PIN'), max_length=6)
    password = forms.CharField(label=_('Password (optional)'), required=False)
