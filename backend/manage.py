#!/usr/bin/env python
import os
import sys


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rewear.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
        "oh my gawd, you need to install Django to run this project. "
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
