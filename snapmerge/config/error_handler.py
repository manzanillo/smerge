from django.shortcuts import render


# custom 404 page
def error_404(request,exception):
    data = {}
    return render(request,'error_404.html', data)

# custom 500 page
def error_500(request):
    data = {} 
    return render(request,'error_500.html', data)
