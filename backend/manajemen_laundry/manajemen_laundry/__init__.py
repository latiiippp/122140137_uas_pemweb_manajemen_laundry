from pyramid.config import Configurator
from pyramid.events import NewRequest # Import NewRequest

# Fungsi callback untuk menambahkan header CORS
def add_cors_headers_response_callback(event):
    def cors_headers(request, response):
        # Sesuaikan origin dengan URL frontend Anda
        response.headers.setdefault('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.setdefault('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE')
        # Header yang diizinkan dalam request (termasuk Authorization untuk token JWT)
        response.headers.setdefault('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        response.headers.setdefault('Access-Control-Allow-Credentials', 'true')
        response.headers.setdefault('Access-Control-Max-Age', '3600') # Cache preflight request selama 1 jam
    event.request.add_response_callback(cors_headers)

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    # Menggunakan 'with Configurator...' juga baik, atau cara standar
    config = Configurator(settings=settings)

    # Tambahkan subscriber untuk CORS SEBELUM include lain jika memungkinkan,
    # atau setidaknya sebelum config.scan()
    config.add_subscriber(add_cors_headers_response_callback, NewRequest)

    # Baris kode Anda yang sudah ada
    # config.include('pyramid_jinja2')
    config.include('.models')
    config.include('.routes')
    # Jika Anda menggunakan pyramid_jwt untuk tween, pastikan itu juga di-include
    # contoh: config.include('pyramid_jwt')

    config.scan()
    return config.make_wsgi_app()