def includeme(config):
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('home', '/')

    # Users routes dengan request_method untuk membedakan endpoint dengan URL yang sama
    config.add_route('users_list', '/users', request_method='GET')
    config.add_route('user_detail', '/users/{id}', request_method='GET')
    config.add_route('user_add', '/users', request_method='POST')
    config.add_route('user_update', '/users/{id}', request_method='PUT')
    config.add_route('user_delete', '/users/{id}', request_method='DELETE')
