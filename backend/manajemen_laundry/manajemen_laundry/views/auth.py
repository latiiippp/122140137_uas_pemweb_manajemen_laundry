from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPBadRequest, HTTPUnauthorized, HTTPOk, HTTPForbidden

import jwt # Library PyJWT
import datetime # Untuk mengatur waktu kedaluwarsa token
from passlib.hash import pbkdf2_sha256 # Untuk verifikasi password

from ..models import Users # Model User Anda

@view_config(route_name='login', request_method='POST', renderer='json')
def login_view(request):
    try:
        data = request.json_body
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return HTTPBadRequest(json_body={'message': 'Username dan password diperlukan'})

        # Cari user di database
        user = request.dbsession.query(Users).filter_by(username=username).first()

        if user and pbkdf2_sha256.verify(password, user.password):
            # Kredensial valid, buat JWT
            
            # Ambil secret key dari settings
            jwt_secret = request.registry.settings.get('jwt.secret')
            if not jwt_secret:
                # Sebaiknya log error ini di sisi server
                print("ERROR: jwt.secret tidak ditemukan di settings") 
                return HTTPBadRequest(json_body={'message': 'Konfigurasi server error'})

            # Payload untuk token (informasi yang ingin Anda simpan di token)
            payload = {
                'user_id': user.id,
                'username': user.username,
                'role': user.role,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token berlaku selama 1 jam
                # Anda bisa menambahkan 'iat' (issued at) jika perlu: 'iat': datetime.datetime.utcnow()
            }

            # Generate token
            token = jwt.encode(payload, jwt_secret, algorithm='HS256')

            return HTTPOk(json_body={'token': token, 'user': user.to_dict()})
        else:
            # Kredensial tidak valid
            return HTTPUnauthorized(json_body={'message': 'Username atau password salah'})

    except Exception as e:
        # Log error di sini jika perlu
        # import logging
        # log = logging.getLogger(__name__)
        # log.error(f"Error saat login: {e}", exc_info=True)
        return HTTPBadRequest(json_body={'message': f'Terjadi kesalahan: {str(e)}'})

@view_config(route_name='login_preflight', request_method='OPTIONS')
def login_preflight(request):
    response = Response()
    # CORS headers akan ditambahkan oleh subscriber kita
    return response

def get_current_user_from_token(request):
    """
    Mengekstrak token JWT dari header Authorization, memverifikasinya,
    dan mengembalikan payload pengguna jika valid.
    Mengembalikan None jika token tidak ada, tidak valid, atau kedaluwarsa.
    Melemparkan HTTPForbidden jika otorisasi gagal karena alasan tertentu.
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None 

    parts = auth_header.split()

    if parts[0].lower() != 'bearer' or len(parts) == 1 or len(parts) > 2:
        return None 
    
    token = parts[1]
    jwt_secret = request.registry.settings.get('jwt.secret')
    if not jwt_secret:
        print("SERVER ERROR: jwt.secret tidak dikonfigurasi.")
        raise HTTPForbidden("Kesalahan konfigurasi server otentikasi.") # Diubah agar lebih jelas errornya

    try:
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        # Untuk kasus ini, lebih baik client tahu tokennya expired
        # Anda bisa membuat custom exception atau return kode spesifik jika perlu
        # Untuk sekarang, None akan ditangani sebagai Unauthorized oleh pemanggil
        return None 
    except jwt.InvalidTokenError:
        return None
    except Exception as e:
        print(f"Error saat decode token: {e}")
        return None