def includeme(config):
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('home', '/')

    # Users routes dengan request_method untuk membedakan endpoint dengan URL yang sama
    config.add_route('users_list', '/users', request_method='GET')
    config.add_route('user_detail', '/users/{id}', request_method='GET')
    config.add_route('user_add', '/users', request_method='POST')
    config.add_route('user_update', '/users/{id}', request_method='PUT')
    config.add_route('user_delete', '/users/{id}', request_method='DELETE')

    # Pesanan routes
    config.add_route('pesanan_list', '/pesanan', request_method='GET') # Mendapatkan semua pesanan
    config.add_route('pesanan_add', '/pesanan', request_method='POST') # Membuat pesanan baru
    config.add_route('pesanan_detail', '/pesanan/{id}', request_method='GET') # Mendapatkan detail satu pesanan
    config.add_route('pesanan_update', '/pesanan/{id}', request_method='PUT') # Memperbarui pesanan
    config.add_route('pesanan_delete', '/pesanan/{id}', request_method='DELETE') # Menghapus pesanan

    # Auth routes
    config.add_route('login', '/login', request_method='POST')  # Endpoint untuk login
    config.add_route('logout', '/logout', request_method='POST')  # Endpoint untuk logout
