from fastapi import APIRouter, Query, Body
from datetime import datetime, timedelta
from config.database import products_collection, stock_batches_collection, sales_collection
from utils.helpers import to_datetime, format_date
from zoneinfo import ZoneInfo
from typing import Optional


router = APIRouter(prefix="/data", tags=["Data"])


