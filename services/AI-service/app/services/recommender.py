import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from ..models import ProviderProfile, Service, Review, User, UserProfile

# Configuration: Default Fallback Location (San Jose, Central Park)
DEFAULT_LAT = 9.9333
DEFAULT_LON = -84.0833

def calculate_haversine(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in kilometers
    try:
        # Ensure inputs are floats and convert to radians
        lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
        lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    except (ValueError, TypeError):
        return 99999.9 # Return infinite distance on error

    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat / 2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    return R * c

def get_recommendations_logic(db: Session, user_id: int, radius_km: float, manual_lat: float = None, manual_lon: float = None):
    
    target_lat = None
    target_lon = None
    using_default_loc = False

    # --- STEP 1: DETERMINE USER LOCATION ---

    # Priority A: Manual GPS (Provided by Frontend/Mobile App)
    if manual_lat is not None and manual_lon is not None:
        target_lat = manual_lat
        target_lon = manual_lon
    
    # Priority B: Database Profile (Using specific Latitude/Longitude columns)
    else:
        user_profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        
        # Check if profile exists and has valid coordinates
        if user_profile and user_profile.latitude is not None and user_profile.longitude is not None:
            target_lat = user_profile.latitude
            target_lon = user_profile.longitude

    # Priority C: Plan B (Default Location Fallback)
    if target_lat is None or target_lon is None:
        target_lat = DEFAULT_LAT
        target_lon = DEFAULT_LON
        using_default_loc = True

    # --- STEP 2: QUERY PROVIDERS DATA ---
    query = db.query(
        ProviderProfile.provider_id,
        ProviderProfile.latitude,
        ProviderProfile.longitude,
        UserProfile.first_name,
        UserProfile.last_name,
        Service.service_title,
        Review.rating
    ).join(User, ProviderProfile.user_id == User.user_id)\
     .join(UserProfile, User.user_id == UserProfile.user_id)\
     .join(Service, ProviderProfile.provider_id == Service.provider_id)\
     .outerjoin(Review, User.user_id == Review.reviewed_user_id)\
     .filter(Service.is_active == True)

    df = pd.read_sql(query.statement, db.bind)

    if df.empty:
        return [], target_lat, target_lon, using_default_loc

    # --- STEP 3: PROCESS WITH PANDAS ---
    
    # Group by provider to aggregate services and calculate average rating
    df_grouped = df.groupby(['provider_id', 'latitude', 'longitude', 'first_name', 'last_name']).agg({
        'service_title': lambda x: list(set(x)), 
        'rating': 'mean'
    }).reset_index()

    # Calculate Distance using Haversine formula
    df_grouped['distance_km'] = df_grouped.apply(
        lambda row: calculate_haversine(target_lat, target_lon, row['latitude'], row['longitude']), axis=1
    )

    # Filter by Radius (Only if NOT using default location)
    if not using_default_loc:
        df_nearby = df_grouped[df_grouped['distance_km'] <= radius_km].copy()
    else:
        # If using default location, show all but sorted by distance to default
        df_nearby = df_grouped.copy()

    # Fill NaN ratings with 0
    df_nearby['rating'] = df_nearby['rating'].fillna(0)
    
    # Sort: Nearest first, then Highest Rated
    df_nearby = df_nearby.sort_values(by=['distance_km', 'rating'], ascending=[True, False])

    return df_nearby.to_dict(orient='records'), target_lat, target_lon, using_default_loc