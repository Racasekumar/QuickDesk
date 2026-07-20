from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.security import hash_password, verify_password, create_access_token
from database import get_db
from models.user import User, UserRole
from schemas.user import RegisterRequest, LoginRequest, LoginResponse, UserOut

router = APIRouter()


# ── Helper ────────────────────────────────────────────────────────

def _get_user_by_email(email: str, db: Session) -> User | None:
    return db.query(User).filter(User.email == email).first()


def _register_user(req: RegisterRequest, role: UserRole, db: Session) -> LoginResponse:
    existing = _get_user_by_email(req.email, db)
    if existing:
        if existing.role == role:
            raise HTTPException(status_code=409, detail="Email already registered")
        other = "agent" if role == UserRole.employee else "employee"
        raise HTTPException(
            status_code=409,
            detail=f"This email is already registered as an {other}. You can only have one role."
        )

    user = User(
        full_name=req.full_name,
        email=req.email,
        hashed_password=hash_password(req.password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, user.role)
    return LoginResponse(access_token=token, user=UserOut.model_validate(user))


def _login_user(req: LoginRequest, expected_role: UserRole, db: Session) -> LoginResponse:
    user = _get_user_by_email(req.email, db)

    # Generic invalid credentials (don't reveal which part is wrong)
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Role mismatch — they exist but used the wrong portal
    if user.role != expected_role:
        portal = "agent" if expected_role == UserRole.employee else "employee"
        raise HTTPException(
            status_code=403,
            detail=f"This account belongs to the {user.role} portal. Please use the {user.role} login."
        )

    token = create_access_token(user.id, user.role)
    return LoginResponse(access_token=token, user=UserOut.model_validate(user))


# ── Employee Auth ─────────────────────────────────────────────────

@router.post("/employee/register", response_model=LoginResponse, status_code=201)
def employee_register(req: RegisterRequest, db: Session = Depends(get_db)):
    return _register_user(req, UserRole.employee, db)


@router.post("/employee/login", response_model=LoginResponse)
def employee_login(req: LoginRequest, db: Session = Depends(get_db)):
    return _login_user(req, UserRole.employee, db)


# ── Agent Auth ────────────────────────────────────────────────────

@router.post("/agent/register", response_model=LoginResponse, status_code=201)
def agent_register(req: RegisterRequest, db: Session = Depends(get_db)):
    return _register_user(req, UserRole.agent, db)


@router.post("/agent/login", response_model=LoginResponse)
def agent_login(req: LoginRequest, db: Session = Depends(get_db)):
    return _login_user(req, UserRole.agent, db)
