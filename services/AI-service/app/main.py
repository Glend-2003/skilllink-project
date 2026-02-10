from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from .database import get_db
from .services.recommender import get_recommendations_logic

app = FastAPI(title="SkillLink AI")

@app.get("/")
def read_root():
    return {"status": "AI Service Running Correctly"}

@app.get("/recommendations/{user_id}")
def recommend_providers(
    user_id: int, 
    radius_km: float = 10.0, 
    lat: Optional[float] = Query(None, description="Optional manual latitude (GPS)"),
    lon: Optional[float] = Query(None, description="Optional manual longitude (GPS)"),
    db: Session = Depends(get_db)
):
    try:
        # Call logic with optional manual coordinates
        providers, used_lat, used_lon, is_default = get_recommendations_logic(
            db, user_id, radius_km, lat, lon
        )
        
        return {
            "user_location": {
                "lat": used_lat, 
                "lng": used_lon,
                "is_default_fallback": is_default # Front-end can show a warning if True
            },
            "count": len(providers),
            "providers": providers
        }
    except Exception as e:
        print(f"Internal Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")