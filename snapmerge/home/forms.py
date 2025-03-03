from django import forms
from django.utils.translation import gettext_lazy as _


class OpenProjectForm(forms.Form):
    pin = forms.CharField(label=_('PIN'), max_length=6)
    password = forms.CharField(label=_('Password (optional)'), required=False, widget=forms.PasswordInput())


class RestoreInfoForm(forms.Form):
    email = forms.EmailField(label=_('Email'))


class ResetPasswordForm(forms.Form):
    new_password = forms.CharField(label=_('New Password'), widget=forms.PasswordInput(render_value=True),
                                   help_text=_('Enter a new password.'), required=True)
    new_password_repeated = forms.CharField(label=_('Repeat Password'), widget=forms.PasswordInput(render_value=True),
                                            help_text=_('Enter the same password as before, for verification.'), required=True)
