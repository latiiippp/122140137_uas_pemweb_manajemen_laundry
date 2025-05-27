def includeme(config):
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('home', '/')


    # Rute untuk autentikasi
    config.add_route('login', '/login', request_method='POST')
    config.add_route('login_preflight', '/login', request_method='OPTIONS')
    config.add_route('logout', '/logout', request_method='POST')
    config.add_route('current_user_me', '/me', request_method='GET')
    config.add_route('current_user_me_preflight', '/me', request_method='OPTIONS')


    # Rute untuk Users
    config.add_route('users_list', '/users', request_method='GET') # Untuk GET (fetchUsers)
    config.add_route('user_add', '/users', request_method='POST') # Untuk POST (addUser)
    config.add_route('users_preflight', '/users', request_method='OPTIONS')
    config.add_route('user_detail', '/users/{user_id}', request_method='GET')
    config.add_route('user_update', '/users/{user_id}', request_method='PUT')
    config.add_route('user_delete', '/users/{user_id}', request_method='DELETE')
    config.add_route('user_detail_preflight', '/users/{user_id}', request_method='OPTIONS')

    # Pesanan routes
    config.add_route('pesanan_list', '/pesanan', request_method='GET') # Mendapatkan semua pesanan
    config.add_route('pesanan_add', '/pesanan', request_method='POST') # Membuat pesanan baru
    config.add_route('pesanan_detail', '/pesanan/{id}', request_method='GET') # Mendapatkan detail satu pesanan
    config.add_route('pesanan_update', '/pesanan/{id}', request_method='PUT') # Memperbarui pesanan
    config.add_route('pesanan_delete', '/pesanan/{id}', request_method='DELETE') # Menghapus pesanan
    config.add_route('pesanan_preflight', '/pesanan', request_method='OPTIONS')
    config.add_route('pesanan_detail_preflight', '/pesanan/{id}', request_method='OPTIONS')