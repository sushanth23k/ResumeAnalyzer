from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
import time


class Command(BaseCommand):
    help = 'Test email delivery - sends a test email instantly'

    def add_arguments(self, parser):
        parser.add_argument(
            'recipient',
            type=str,
            help='Email address to send test email to'
        )

    def handle(self, *args, **options):
        recipient = options['recipient']
        
        self.stdout.write(self.style.WARNING(f'\n{"="*60}'))
        self.stdout.write(self.style.WARNING('EMAIL DELIVERY TEST'))
        self.stdout.write(self.style.WARNING(f'{"="*60}\n'))
        
        self.stdout.write(f'📧 Recipient: {recipient}')
        self.stdout.write(f'⚙️  Backend: {settings.EMAIL_BACKEND}')
        self.stdout.write(f'🕐 Timezone: {settings.TIME_ZONE}')
        self.stdout.write(f'📤 From: {settings.DEFAULT_FROM_EMAIL}\n')
        
        self.stdout.write(self.style.WARNING('Sending email NOW...'))
        start_time = time.time()
        
        try:
            send_mail(
                subject='Test Email from ResumeAnalyzer',
                message=(
                    'This is a test email to verify instant delivery.\n\n'
                    'If you received this email, it means:\n'
                    '✅ Email configuration is working\n'
                    '✅ Emails are delivered instantly (no timezone delays)\n'
                    '✅ SMTP connection is successful\n\n'
                    'Timestamp: This email was sent immediately when you ran the command.\n'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
            
            elapsed = (time.time() - start_time) * 1000  # Convert to milliseconds
            
            self.stdout.write(self.style.SUCCESS(f'\n✅ Email sent successfully in {elapsed:.2f}ms'))
            
            if 'console' in settings.EMAIL_BACKEND.lower():
                self.stdout.write(self.style.WARNING(
                    '\n⚠️  You are using Console Email Backend.\n'
                    '   The email was printed above (not sent to actual inbox).\n'
                    '   To send real emails, configure SMTP in .env file.\n'
                    '   See EMAIL_SETUP.md for instructions.'
                ))
            else:
                self.stdout.write(self.style.SUCCESS(
                    f'\n✅ Real email sent to {recipient}\n'
                    '   Check your inbox (and spam folder).'
                ))
                
        except Exception as e:
            elapsed = (time.time() - start_time) * 1000
            self.stdout.write(self.style.ERROR(f'\n❌ Email failed after {elapsed:.2f}ms'))
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
            self.stdout.write(self.style.WARNING(
                '\nTroubleshooting:\n'
                '1. Check your .env file for correct SMTP settings\n'
                '2. Verify EMAIL_HOST_USER and EMAIL_HOST_PASSWORD\n'
                '3. For Gmail: Use App Password (not regular password)\n'
                '4. Check firewall/network settings\n'
                '5. See EMAIL_SETUP.md for detailed instructions'
            ))
            
        self.stdout.write(self.style.WARNING(f'\n{"="*60}\n'))
