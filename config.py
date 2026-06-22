"""
Application Configuration
"""

import os


class Config:
    # Maximum upload size: 500 MB
    MAX_CONTENT_LENGTH = int(os.environ.get("MAX_CONTENT_LENGTH", 500 * 1024 * 1024))

    # Directories for temporary file storage
    UPLOAD_DIR = os.environ.get("UPLOAD_DIR", os.path.join(os.path.dirname(__file__), "uploads"))
    OUTPUT_DIR = os.environ.get("OUTPUT_DIR", os.path.join(os.path.dirname(__file__), "outputs"))

    # Max files in a single batch conversion
    MAX_BATCH_FILES = int(os.environ.get("MAX_BATCH_FILES", 5))

    # Max recent conversions to keep in history
    MAX_HISTORY = int(os.environ.get("MAX_HISTORY", 20))


# Ensure directories exist on import
os.makedirs(Config.UPLOAD_DIR, exist_ok=True)
os.makedirs(Config.OUTPUT_DIR, exist_ok=True)
