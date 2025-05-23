from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Enum,
)
from passlib.hash import pbkdf2_sha256
from .meta import Base

class Users(Base):
    """ Model untuk tabel users (login admin/karyawan) """
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(255), nullable=False, unique=True)
    password = Column(Text, nullable=False)
    role = Column(Enum('admin', 'karyawan', name='user_role_enum'), nullable=False)

    def set_password(self, pw):
        """Method untuk men-set dan hash password."""
        self.password = pbkdf2_sha256.hash(pw)

    def check_password(self, pw):
        """Method untuk memverifikasi password."""
        if self.password is None:
            return False
        return pbkdf2_sha256.verify(pw, self.password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'password': self.password,
            'role': self.role,
        }