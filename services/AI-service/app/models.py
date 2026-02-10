from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users" # Correct table name in plural
    user_id = Column(Integer, primary_key=True)
    email = Column(String)
    
    # Relationship with Profile
    profile = relationship("UserProfile", back_populates="user", uselist=False)

class UserProfile(Base):
    __tablename__ = "user_profiles"
    profile_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    first_name = Column(String)
    last_name = Column(String)
    
    # --- NEW FIELDS: GEOLOCATION ---
    # We now map these directly to the Float columns in MySQL
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Address text fields (Optional/Legacy)
    address_line1 = Column(String) 
    address_line2 = Column(String) 
    
    user = relationship("User", back_populates="profile")

class ProviderProfile(Base):
    __tablename__ = "provider_profiles"
    provider_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    latitude = Column(Float)
    longitude = Column(Float)
    
    services = relationship("Service", back_populates="provider")

class Service(Base):
    __tablename__ = "services"
    service_id = Column(Integer, primary_key=True)
    provider_id = Column(Integer, ForeignKey("provider_profiles.provider_id"))
    service_title = Column(String)
    is_active = Column(Boolean)
    base_price = Column(Float)
    
    provider = relationship("ProviderProfile", back_populates="services")

class Review(Base):
    __tablename__ = "reviews"
    review_id = Column(Integer, primary_key=True)
    reviewed_user_id = Column(Integer, ForeignKey("users.user_id"))
    rating = Column(Integer)