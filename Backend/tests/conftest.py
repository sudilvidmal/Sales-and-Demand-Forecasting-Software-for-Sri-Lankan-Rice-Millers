# tests/conftest.py
import asyncio
import sys
import pytest

# Required for Windows and Python 3.8+
if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Explicitly define event loop scope
@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()
