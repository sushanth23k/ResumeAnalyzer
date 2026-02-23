import os
from allauth.account.adapter import DefaultAccountAdapter


class CustomAccountAdapter(DefaultAccountAdapter):
    """
    Custom adapter to override allauth's default email verification URL generation.
    Points to frontend page instead of backend API.
    """
    
    def get_email_confirmation_url(self, request, emailconfirmation):
        """
        Override to use frontend verification page instead of backend API.
        """
        key = emailconfirmation.key
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
        
        # Return frontend URL that will handle the verification
        return f"{frontend_url}/auth/verify-email/{key}"
