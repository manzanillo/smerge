from django import forms

class OpenProjectForm(forms.Form):
    project = forms.IntegerField(label='Project Identifier')