"""
Run this once to create sample users in the DB.
Usage: python seed.py
"""
from database import SessionLocal, Base, engine
from models.user import User, UserRole
from core.security import hash_password
from core.config import settings

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        # Seed agent
        if not db.query(User).filter(User.email == settings.SEED_AGENT_EMAIL).first():
            db.add(User(
                full_name="Support Agent",
                email=settings.SEED_AGENT_EMAIL,
                hashed_password=hash_password(settings.SEED_AGENT_PASSWORD),
                role=UserRole.agent,
            ))
            print(f"Created agent: {settings.SEED_AGENT_EMAIL}")
        else:
            print(f"Agent already exists: {settings.SEED_AGENT_EMAIL}")

        # Seed employee
        if not db.query(User).filter(User.email == settings.SEED_EMPLOYEE_EMAIL).first():
            db.add(User(
                full_name="John Employee",
                email=settings.SEED_EMPLOYEE_EMAIL,
                hashed_password=hash_password(settings.SEED_EMPLOYEE_PASSWORD),
                role=UserRole.employee,
            ))
            print(f"Created employee: {settings.SEED_EMPLOYEE_EMAIL}")
        else:
            print(f"Employee already exists: {settings.SEED_EMPLOYEE_EMAIL}")

        db.commit()
        print("Seed complete!")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
