class Config:
    # Set your secret key to secure your application
    SECRET_KEY = "!wz56TjHPpGkS^G#@4MY4c58hU#68b^PLMsithamL#QHFoc8f^jX$AudSDprhN&E*BHLUSyF#hfLjApGVcn6JKidEw*p3yRK4t!tg9^2FJ@aJy3za&ZUaSoZXP#5N!*D"

    # Configure the database connection
    SQLALCHEMY_DATABASE_URI = 'sqlite:///local.sqlite3'

    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Disable Flask-SQLAlchemy modification tracking
