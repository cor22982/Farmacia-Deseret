from datetime import datetime, timedelta

def to_datetime(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    return None

def format_date(value):
    """Devuelve fecha en formato DD/MM/YYYY"""
    dt = to_datetime(value)
    return dt.strftime("%d/%m/%Y") if dt else None