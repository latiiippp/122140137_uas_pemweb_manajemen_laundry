from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Enum,
    Float,
    DateTime,
)
from passlib.hash import pbkdf2_sha256
from .meta import Base
from sqlalchemy.sql import func
import math

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
    
class Pesanan(Base):
    """ Model untuk tabel pesanan laundry """
    __tablename__ = 'pesanan'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nama_pelanggan = Column(String(255), nullable=False)
    nomor_hp = Column(String(20), nullable=True)
    jenis_layanan = Column(Enum('cuci_setrika', 'cuci_saja', 'setrika_saja', name='jenis_layanan_enum'), nullable=False)
    kategori_layanan = Column(Enum('kiloan', 'satuan', name='kategori_layanan_enum'), nullable=False)
    jumlah = Column(Float, nullable=False) # Ini adalah berat/jumlah aktual yang diinput
    harga = Column(Integer, nullable=False) # Dihitung berdasarkan jumlah yang sudah dibulatkan (jika kiloan)
    status = Column(Enum('dilaundry', 'siap_diambil', 'selesai', name='status_pesanan_enum'), nullable=False, default='dilaundry')
    tanggal_masuk = Column(DateTime, nullable=False, default=func.now())
    tanggal_keluar = Column(DateTime, nullable=True)
    catatan = Column(Text, nullable=True)

    def to_dict(self):
        data = {
            'id': self.id,
            'nama_pelanggan': self.nama_pelanggan,
            'nomor_hp': self.nomor_hp,
            'jenis_layanan': self.jenis_layanan,
            'kategori_layanan': self.kategori_layanan,
            'jumlah_aktual': self.jumlah, # Menampilkan jumlah asli yang diinput
            'harga': self.harga,
            'status': self.status,
            'tanggal_masuk': self.tanggal_masuk.isoformat() if self.tanggal_masuk else None,
            'tanggal_keluar': self.tanggal_keluar.isoformat() if self.tanggal_keluar else None,
            'catatan': self.catatan,
        }
        # Tambahkan jumlah yang digunakan untuk perhitungan harga
        if self.kategori_layanan == 'kiloan':
            data['jumlah_dihitung_untuk_harga'] = math.ceil(self.jumlah)
        else: # Untuk 'satuan', jumlah aktual sama dengan jumlah untuk harga
            data['jumlah_dihitung_untuk_harga'] = self.jumlah
        return data
