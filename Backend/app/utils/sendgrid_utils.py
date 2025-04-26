# app/utils/sendgrid_utils.py

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_API_KEY = ""  # 🔥 Very important
FROM_EMAIL = "thennakoonsudil@gmail.com"  # 🔥 Your verified sender email

async def send_reset_email(to_email: str, reset_link: str):
    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject="Password Reset Request",
        html_content=f"""
  <div style="background-color: #f5f7fa; padding: 40px 0; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; background: white; margin: auto; padding: 40px; border-radius: 8px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05); text-align: center;">
    
    <!-- Heading -->
    <h2 style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px;">
      Password Reset
    </h2>

    <!-- Instruction Text -->
    <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
      If you've lost your password or wish to reset it, use the link below to get started.
    </p>

    <!-- Reset Button -->
    <div style="margin-bottom: 30px;">
      <a href="{reset_link}" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 16px;">
        Reset Your Password
      </a>
    </div>

    <!-- Footer text -->
    <p style="font-size: 14px; color: #999;">
      If you did not request a password reset, you can safely ignore this email. Only a person with access to your email can reset your account password.
    </p>
    
  </div>
</div>
        """
    )

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"✅ Email sent with status {response.status_code}")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
 