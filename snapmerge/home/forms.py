from django import forms

class OpenProjectForm(forms.Form):
    project = forms.CharField(label='Project Identifier', max_length=100)