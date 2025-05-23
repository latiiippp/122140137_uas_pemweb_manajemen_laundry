import datetime # Mungkin tidak diperlukan lagi jika Users tidak punya tanggal
from pyramid.view import view_config
from pyramid.httpexceptions import (
    HTTPFound,
    HTTPNotFound,
    HTTPBadRequest,
)
from ..models import Users


@view_config(route_name='users_list', renderer='json')
def users_list(request):
    """View untuk menampilkan daftar users"""
    dbsession = request.dbsession
    users = dbsession.query(Users).all()
    return {'users': [u.to_dict() for u in users]} 


@view_config(route_name='user_detail', renderer='json')
def user_detail(request):
    """View untuk melihat detail satu user"""
    dbsession = request.dbsession
    user_id = request.matchdict['id']
    user = dbsession.query(Users).filter_by(id=user_id).first()
    
    if user is None:
        return HTTPNotFound(json_body={'error': 'User tidak ditemukan'})
    
    return {'user': user.to_dict()} 


@view_config(route_name='user_add', request_method='POST', renderer='json')
def user_add(request):
    """View untuk menambahkan user baru"""
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
def user_update(request):
    """View untuk mengupdate data user"""
    dbsession = request.dbsession
    user_id = request.matchdict['id']
    
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
                
        return {'success': True, 'user': user.to_dict()}
        
    except Exception as e:
        # import logging
        # log = logging.getLogger(__name__)
        # log.error(f"Error updating user {user_id}: {e}", exc_info=True)
        return HTTPBadRequest(json_body={'error': 'Terjadi kesalahan saat mengupdate user'})


@view_config(route_name='user_delete', request_method='DELETE', renderer='json')
def user_delete(request):
    """View untuk menghapus data user"""
    dbsession = request.dbsession
    user_id = request.matchdict['id']
    
    user = dbsession.query(Users).filter_by(id=user_id).first()
    if user is None:
        return HTTPNotFound(json_body={'error': 'User tidak ditemukan'})
    
    # Tidak mengizinkan user menghapus dirinya sendiri, atau role tertentu
    if request.authenticated_userid == user.id:
        return HTTPBadRequest(json_body={'error': 'Tidak dapat menghapus diri sendiri'})

    dbsession.delete(user)
    
    return {'success': True, 'message': f'User dengan id {user_id} berhasil dihapus'}