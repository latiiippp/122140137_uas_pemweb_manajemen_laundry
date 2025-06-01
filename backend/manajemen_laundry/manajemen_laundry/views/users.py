import datetime # Mungkin tidak diperlukan lagi jika Users tidak punya tanggal
from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import (
    HTTPFound,
    HTTPNotFound,
    HTTPBadRequest,
    HTTPOk,
    HTTPCreated,
    HTTPUnauthorized,
    HTTPForbidden
)
import transaction
from ..models import Users
from passlib.hash import pbkdf2_sha256
from .auth import get_current_user_from_token


@view_config(route_name='users_list', renderer='json')
def users_list_view(request):
    """View untuk menampilkan daftar users"""
    current_user_payload = get_current_user_from_token(request)
    if not current_user_payload:
        return HTTPUnauthorized(json_body={'message': 'Otentikasi diperlukan. Token tidak valid atau tidak ada.'})

    user_role = current_user_payload.get('role')
    if user_role != 'admin':
        return HTTPForbidden(json_body={'message': 'Anda tidak memiliki izin untuk mengakses daftar pengguna.'})
    dbsession = request.dbsession
    users = dbsession.query(Users).all()
    return {'users': [u.to_dict() for u in users]} 


@view_config(route_name='user_detail', renderer='json')
def user_detail_view(request):
    """View untuk melihat detail satu user"""
    current_user_payload = get_current_user_from_token(request)
    if not current_user_payload:
        return HTTPUnauthorized(json_body={'message': 'Otentikasi diperlukan. Token tidak valid atau tidak ada.'})
    user_role = current_user_payload.get('role')
    if user_role != 'admin':
        return HTTPForbidden(json_body={'message': 'Anda tidak memiliki izin untuk mengakses detail pengguna.'})
    
    dbsession = request.dbsession
    user_id = request.matchdict['user_id']
    user = dbsession.query(Users).filter_by(id=user_id).first()
    
    if user is None:
        return HTTPNotFound(json_body={'error': 'User tidak ditemukan'})
    
    return {'user': user.to_dict()} 


@view_config(route_name='user_add', request_method='POST', renderer='json')
def user_add_view(request):
    """View untuk menambahkan user baru"""
    current_user_payload = get_current_user_from_token(request)

    if not current_user_payload:
        return HTTPUnauthorized(json_body={'message': 'Otentikasi diperlukan. Token tidak valid atau tidak ada.'})
    user_role = current_user_payload.get('role')
    if user_role != 'admin':
        return HTTPForbidden(json_body={'message': 'Anda tidak memiliki izin untuk menambahkan pengguna.'})
    
    try:
        json_data = request.json_body
        
        required_fields = ['username', 'password', 'role']
        for field in required_fields:
            if field not in json_data:
                return HTTPBadRequest(json_body={'error': f'Field {field} wajib diisi'})

        # Cek apakah username sudah ada
        existing_user = request.dbsession.query(Users).filter_by(username=json_data['username']).first()
        if existing_user:
            return HTTPBadRequest(json_body={'error': f'Username {json_data["username"]} sudah digunakan'})

        # Validasi role (hanya 'admin' atau 'karyawan')
        allowed_roles = ['admin', 'karyawan']
        if json_data['role'] not in allowed_roles:
            return HTTPBadRequest(json_body={'error': f'Role tidak valid. Pilih dari: {", ".join(allowed_roles)}'})

        new_user = Users(
            username=json_data['username'],
            role=json_data['role']
        )
        new_user.set_password(json_data['password']) # Gunakan set_password
        
        dbsession = request.dbsession
        dbsession.add(new_user)
        dbsession.flush() 
        
        return {'success': True, 'user': new_user.to_dict()}
            
    except Exception as e:
        # Log error di server untuk debugging
        # import logging
        # log = logging.getLogger(__name__)
        # log.error(f"Error adding user: {e}", exc_info=True)
        return HTTPBadRequest(json_body={'error': 'Terjadi kesalahan saat menambahkan user'})


@view_config(route_name='user_update', request_method='PUT', renderer='json')
def user_update_view(request):
    """View untuk mengupdate data user"""
    current_user_payload = get_current_user_from_token(request)
    if not current_user_payload:
        return HTTPUnauthorized(json_body={'message': 'Otentikasi diperlukan. Token tidak valid atau tidak ada.'})
    user_role = current_user_payload.get('role')
    if user_role != 'admin':
        return HTTPForbidden(json_body={'message': 'Anda tidak memiliki izin untuk mengupdate pengguna.'})
    
    dbsession = request.dbsession
    user_id = request.matchdict['user_id']
    
    user = dbsession.query(Users).filter_by(id=user_id).first()
    if user is None:
        return HTTPNotFound(json_body={'error': 'User tidak ditemukan'})
    
    try:
        json_data = request.json_body
        
        # Update username jika ada dan belum dipakai oleh user lain (kecuali user ini sendiri)
        if 'username' in json_data and user.username != json_data['username']:
            existing_user = dbsession.query(Users).filter(Users.username == json_data['username'], Users.id != user_id).first()
            if existing_user:
                return HTTPBadRequest(json_body={'error': f'Username {json_data["username"]} sudah digunakan'})
            user.username = json_data['username']

        # Update role jika ada
        if 'role' in json_data:
            allowed_roles = ['admin', 'karyawan']
            if json_data['role'] not in allowed_roles:
                return HTTPBadRequest(json_body={'error': f'Role tidak valid. Pilih dari: {", ".join(allowed_roles)}'})
            user.role = json_data['role']
            
        # Update password jika ada
        if 'password' in json_data and json_data['password']: # Password tidak boleh kosong
            user.set_password(json_data['password'])
            
        # TAMBAHKAN KODE INI: Commit perubahan ke database
        with transaction.manager:
            dbsession.add(user)  # SQLAlchemy akan menangani ini sebagai update
                
        return {'success': True, 'user': user.to_dict()}
        
    except Exception as e:
        return HTTPBadRequest(json_body={'error': 'Terjadi kesalahan saat mengupdate user'})


@view_config(route_name='user_delete', request_method='DELETE', renderer='json')
def user_delete_view(request):
    """View untuk menghapus data user (hanya admin)"""
    current_user_payload = get_current_user_from_token(request)
    if not current_user_payload:
        return HTTPUnauthorized(json_body={'message': 'Otentikasi diperlukan. Token tidak valid atau tidak ada.'})

    user_role = current_user_payload.get('role')
    
    if user_role != 'admin':
        return HTTPForbidden(json_body={'message': 'Anda tidak memiliki izin untuk menghapus pengguna.'})

    try:
        user_id_to_delete = int(request.matchdict['user_id'])
        
        # Mencegah admin menghapus dirinya sendiri
        if user_id_to_delete == current_user_payload.get('user_id'):
            return HTTPForbidden(json_body={'error': 'Admin tidak dapat menghapus dirinya sendiri.'})

        user_to_delete = request.dbsession.query(Users).filter_by(id=user_id_to_delete).first()
        if user_to_delete is None:
            return HTTPNotFound(json_body={'error': 'User tidak ditemukan'})
        
        # Mencegah penghapusan admin terakhir
        if user_to_delete.role == 'admin':
            admin_count = request.dbsession.query(Users).filter_by(role='admin').count()
            if admin_count <= 1:
                return HTTPForbidden(json_body={'error': 'Tidak dapat menghapus admin terakhir.'})

        with transaction.manager:
            request.dbsession.delete(user_to_delete)
        
        return HTTPOk(json_body={'success': True, 'message': f'User dengan ID {user_id_to_delete} berhasil dihapus'})
    except ValueError:
        return HTTPBadRequest(json_body={'error': 'ID User tidak valid.'})
    except Exception as e:
        return HTTPBadRequest(json_body={'error': f'Terjadi kesalahan saat menghapus user: {str(e)}'})
    
@view_config(route_name='users_preflight', request_method='OPTIONS')
def users_preflight_view(request):
    """Menangani preflight OPTIONS request untuk /users."""
    response = Response()
    return response

@view_config(route_name='user_detail_preflight', request_method='OPTIONS')
def user_detail_preflight_view(request):
    """Menangani preflight OPTIONS request untuk /users/{user_id}."""
    response = Response()
    return response