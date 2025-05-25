from pyramid.view import view_config
from .auth import get_current_user_from_token
from pyramid.response import Response
from pyramid.httpexceptions import (
    HTTPCreated,
    HTTPOk,
    HTTPNotFound,
    HTTPBadRequest,
    HTTPForbidden,
    HTTPUnauthorized
)
import transaction
import math # Untuk math.ceil

from ..models import Pesanan, Users

# --- Daftar Harga ---
HARGA_KILOAN = {
    'cuci_saja': 7000,
    'setrika_saja': 4000,
    'cuci_setrika': 10000,
}
HARGA_SATUAN = {
    'cuci_saja': 3000,
    'setrika_saja': 1500,
    'cuci_setrika': 4000,
}

def hitung_harga(jenis_layanan, kategori_layanan, jumlah):
    """Menghitung harga berdasarkan jenis, kategori, dan jumlah."""
    harga_satuan = 0
    jumlah_dihitung = jumlah

    if kategori_layanan == 'kiloan':
        if jenis_layanan in HARGA_KILOAN:
            harga_satuan = HARGA_KILOAN[jenis_layanan]
        jumlah_dihitung = math.ceil(jumlah) # Pembulatan ke atas untuk kiloan
    elif kategori_layanan == 'satuan':
        if jenis_layanan in HARGA_SATUAN:
            harga_satuan = HARGA_SATUAN[jenis_layanan]
    
    if harga_satuan == 0:
        raise ValueError("Jenis atau kategori layanan tidak valid")

    return int(harga_satuan * jumlah_dihitung)


@view_config(route_name='pesanan_add', request_method='POST', renderer='json')
def pesanan_add_view(request):
    current_user_payload = get_current_user_from_token(request)

    if not current_user_payload:
        return HTTPUnauthorized(json_body={'message': 'Otentikasi diperlukan. Token tidak valid atau tidak ada.'})

    user_role = current_user_payload.get('role')
    if user_role not in ['admin', 'karyawan']:
        return HTTPForbidden(json_body={'message': 'Anda tidak memiliki izin untuk menambahkan pesanan.'})

    try:
        data = request.json_body
        nama_pelanggan = data.get('nama_pelanggan')
        nomor_hp = data.get('nomor_hp')
        jenis_layanan = data.get('jenis_layanan')
        kategori_layanan = data.get('kategori_layanan')
        jumlah_input = data.get('jumlah')

        if not all([nama_pelanggan, jenis_layanan, kategori_layanan, jumlah_input is not None]):
            return HTTPBadRequest("Data tidak lengkap: nama_pelanggan, jenis_layanan, kategori_layanan, dan jumlah diperlukan.")
        
        try:
            jumlah = float(jumlah_input)
            if jumlah <= 0:
                raise ValueError("Jumlah harus lebih besar dari 0.")
        except ValueError as e:
            return HTTPBadRequest(f"Format jumlah tidak valid: {e}")

        try:
            harga_total = hitung_harga(jenis_layanan, kategori_layanan, jumlah)
        except ValueError as e:
            return HTTPBadRequest(str(e))

        pesanan_baru = Pesanan(
            nama_pelanggan=nama_pelanggan,
            nomor_hp=nomor_hp,
            jenis_layanan=jenis_layanan,
            kategori_layanan=kategori_layanan,
            jumlah=jumlah,
            harga=harga_total,
            catatan=data.get('catatan') 
        )
        
        with transaction.manager:
            request.dbsession.add(pesanan_baru)
        
        request.dbsession.flush()
        return HTTPCreated(json_body=pesanan_baru.to_dict())

    except Exception as e:
        # import logging
        # log = logging.getLogger(__name__)
        # log.error(f"Error saat menambahkan pesanan: {e}", exc_info=True)
        return HTTPBadRequest(f"Terjadi kesalahan: {e}")


@view_config(route_name='pesanan_list', request_method='GET', renderer='json')
def pesanan_list_view(request):
    current_user_payload = get_current_user_from_token(request)

    if not current_user_payload:
        return HTTPUnauthorized(json_body={'message': 'Otentikasi diperlukan. Token tidak valid atau tidak ada.'})

    user_role = current_user_payload.get('role')

    # Admin dan karyawan boleh melihat daftar pesanan
    if user_role not in ['admin', 'karyawan']:
        return HTTPForbidden(json_body={'message': 'Anda tidak memiliki izin untuk mengakses daftar pesanan.'})

    try:
        semua_pesanan = request.dbsession.query(Pesanan).order_by(Pesanan.tanggal_masuk.desc()).all()
        hasil = [pesanan.to_dict() for pesanan in semua_pesanan]
        return HTTPOk(json_body=hasil)
    except Exception as e:
        # Log error di sini jika perlu
        return HTTPBadRequest(f"Terjadi kesalahan saat mengambil daftar pesanan: {e}")

@view_config(route_name='pesanan_detail', request_method='GET', renderer='json')
def pesanan_detail_view(request):
    current_user_payload = get_current_user_from_token(request)

    if not current_user_payload:
        return HTTPUnauthorized(json_body={'message': 'Otentikasi diperlukan. Token tidak valid atau tidak ada.'})
    
    user_role = current_user_payload.get('role')

    if user_role not in ['admin', 'karyawan']:
        return HTTPForbidden(json_body={'message': 'Anda tidak memiliki izin untuk mengakses detail pesanan.'})

    pesanan_id = request.matchdict.get('id')

    try:
        pesanan = request.dbsession.query(Pesanan).filter_by(id=pesanan_id).first()
        if not pesanan:
            return HTTPNotFound(json_body={'message': 'Pesanan tidak ditemukan'})
        return HTTPOk(json_body=pesanan.to_dict())
    except Exception as e:
        return HTTPBadRequest(f"Terjadi kesalahan saat mengambil detail pesanan: {e}")

@view_config(route_name='pesanan_update', request_method='PUT', renderer='json')
def pesanan_update_view(request):
    current_user_payload = get_current_user_from_token(request)

    if not current_user_payload:
        return HTTPUnauthorized(json_body={'message': 'Otentikasi diperlukan. Token tidak valid atau tidak ada.'})
    
    user_role = current_user_payload.get('role')

    if user_role not in ['admin', 'karyawan']:
        return HTTPForbidden(json_body={'message': 'Anda tidak memiliki izin untuk memperbarui pesanan.'})

    pesanan_id = request.matchdict.get('id')
    
    try:
        pesanan = request.dbsession.query(Pesanan).filter_by(id=pesanan_id).first()
        if not pesanan:
            return HTTPNotFound(json_body={'message': 'Pesanan tidak ditemukan'})

        data = request.json_body
        
        # Karyawan bisa mengubah: nama_pelanggan, nomor_hp, jenis_layanan, kategori_layanan, jumlah, status, catatan.
        # Harga dan tanggal_masuk tidak bisa diubah secara langsung.
        # Tanggal_keluar akan diupdate otomatis jika status menjadi 'selesai'.

        harga_perlu_dihitung_ulang = False

        if 'nama_pelanggan' in data:
            pesanan.nama_pelanggan = data['nama_pelanggan']
        if 'nomor_hp' in data:
            pesanan.nomor_hp = data.get('nomor_hp') # .get() untuk opsional
        
        if 'jenis_layanan' in data and pesanan.jenis_layanan != data['jenis_layanan']:
            pesanan.jenis_layanan = data['jenis_layanan']
            harga_perlu_dihitung_ulang = True
        
        if 'kategori_layanan' in data and pesanan.kategori_layanan != data['kategori_layanan']:
            pesanan.kategori_layanan = data['kategori_layanan']
            harga_perlu_dihitung_ulang = True
            
        if 'jumlah' in data:
            try:
                jumlah_baru = float(data['jumlah'])
                if jumlah_baru <= 0:
                    return HTTPBadRequest("Jumlah harus lebih besar dari 0.")
                if pesanan.jumlah != jumlah_baru:
                    pesanan.jumlah = jumlah_baru
                    harga_perlu_dihitung_ulang = True
            except ValueError:
                return HTTPBadRequest("Format jumlah tidak valid.")

        if harga_perlu_dihitung_ulang:
            try:
                pesanan.harga = hitung_harga(pesanan.jenis_layanan, pesanan.kategori_layanan, pesanan.jumlah)
            except ValueError as e:
                return HTTPBadRequest(str(e)) # Jika jenis/kategori layanan jadi tidak valid setelah update

        if 'status' in data:
            status_baru = data['status']
            if status_baru not in ['dilaundry', 'siap_diambil', 'selesai']:
                return HTTPBadRequest("Nilai status tidak valid.")
            
            # Jika status berubah menjadi 'selesai', update tanggal_keluar
            if status_baru == 'selesai' and pesanan.status != 'selesai':
                from sqlalchemy.sql import func # Impor func jika belum di scope ini
                pesanan.tanggal_keluar = func.now()
            # Jika status diubah dari 'selesai' ke status lain, kosongkan tanggal_keluar
            elif pesanan.status == 'selesai' and status_baru != 'selesai':
                pesanan.tanggal_keluar = None
            pesanan.status = status_baru
            
        if 'catatan' in data:
            pesanan.catatan = data.get('catatan')

        with transaction.manager:
            request.dbsession.add(pesanan) # SQLAlchemy akan menangani ini sebagai update
        
        request.dbsession.flush()
        return HTTPOk(json_body=pesanan.to_dict())

    except Exception as e:
        # import logging
        # log = logging.getLogger(__name__)
        # log.error(f"Error saat update pesanan {pesanan_id}: {e}", exc_info=True)
        return HTTPBadRequest(f"Terjadi kesalahan saat memperbarui pesanan: {e}")


@view_config(route_name='pesanan_delete', request_method='DELETE', renderer='json')
def pesanan_delete_view(request):
    current_user_payload = get_current_user_from_token(request)

    if not current_user_payload:
        return HTTPUnauthorized(json_body={'message': 'Otentikasi diperlukan. Token tidak valid atau tidak ada.'})
    
    user_role = current_user_payload.get('role')
    if user_role not in ['admin', 'karyawan']:
        return HTTPForbidden(json_body={'message': 'Anda tidak memiliki izin untuk menghapus pesanan.'})
    
    pesanan_id = request.matchdict.get('id')
    try:
        pesanan = request.dbsession.query(Pesanan).filter_by(id=pesanan_id).first()
        if not pesanan:
            return HTTPNotFound(json_body={'message': 'Pesanan tidak ditemukan'})

        with transaction.manager:
            request.dbsession.delete(pesanan)
        
        return HTTPOk(json_body={'message': f'Pesanan dengan ID {pesanan_id} berhasil dihapus'})
    except Exception as e:
        return HTTPBadRequest(f"Terjadi kesalahan saat menghapus pesanan: {e}")