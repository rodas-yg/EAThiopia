#analizes nutritional data the user had logged over time to provide insights and recommendations.
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from datetime import datetime, timezone, timedelta
from models import MealLog, UserStats, db

