from django import forms

class OpenProjectForm(forms.Form):
    pin = forms.CharField(label='PIN', max_length=6)
    password = forms.CharField(label='password (optional)', required=False)