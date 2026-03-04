#Why? Serializers validate and clean the incoming data from the request before we use it. This checks that email, password, and role are all provided and valid.

from rest_framework import serializers
from users.models import User

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    role = serializers.ChoiceField(choices=['doctor', 'nurse', 'admin', 'patient'])