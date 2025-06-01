import pytest
from pyramid.paster import get_appsettings
from webtest import TestApp
import os
import transaction

# Impor main app factory dari __init__.py di paket manajemen_laundry
from . import main as app_main
from .models.meta import Base as meta_Base 
from .models.models import Users, Pesanan # Pastikan Pesanan juga diimpor jika ada fixture yang membutuhkannya
from .models import get_engine, get_session_factory, get_tm_session


INI_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'development.ini')


@pytest.fixture(scope='session')
def test_settings():
    """Memuat settings dan meng-override URL database untuk testing."""
    if not os.path.exists(INI_PATH):
        raise FileNotFoundError(f"File konfigurasi {INI_PATH} tidak ditemukan.")
    
    settings = get_appsettings(INI_PATH, name='main')
    
    original_db_url = settings.get('sqlalchemy.url')
    print(f"[test_settings] Original sqlalchemy.url from .ini: {original_db_url}")
    
    settings['sqlalchemy.url'] = 'postgresql://postgres:12345678@localhost:5432/manajemen_laundry_test'
    print(f"[test_settings] Overridden sqlalchemy.url for testing: {settings['sqlalchemy.url']}")
    
    if 'jwt.secret' not in settings:
        print("[test_settings] jwt.secret not found in .ini, using default 'testsecret' for testing.")
        settings['jwt.secret'] = 'testsecret' 
    else:
        print(f"[test_settings] Using jwt.secret from .ini: {settings['jwt.secret']}")
        
    return settings


@pytest.fixture(scope='session')
def pyramid_app_for_session(test_settings):
    """Membuat instance aplikasi Pyramid (sekali per sesi tes)."""
    print(f"[pyramid_app_for_session] Initializing Pyramid app with sqlalchemy.url: {test_settings.get('sqlalchemy.url')}")
    app = app_main({}, **test_settings)
    if hasattr(app.registry, 'settings'):
        print(f"[pyramid_app_for_session] Pyramid app registry sqlalchemy.url: {app.registry.settings.get('sqlalchemy.url')}")
        print(f"[pyramid_app_for_session] Pyramid app registry jwt.secret: {app.registry.settings.get('jwt.secret')}")
    return app

@pytest.fixture(scope='session')
def initialized_db_for_session(pyramid_app_for_session, test_settings):
    """
    Menginisialisasi database tes: HANYA membuat tabel.
    Berjalan sekali per sesi tes.
    """
    print(f"[initialized_db_for_session] Using sqlalchemy.url from test_settings: {test_settings.get('sqlalchemy.url')}")
    engine = get_engine(test_settings) 
    print(f"[initialized_db_for_session] Engine object created with URL: {engine.url}")
    
    meta_Base.metadata.drop_all(bind=engine, checkfirst=True) 
    meta_Base.metadata.create_all(bind=engine) 
    print(f"Skema database tes di {str(engine.url)} telah dibuat.")
    yield engine 


@pytest.fixture
def testapp(pyramid_app_for_session, initialized_db_for_session): 
    """Menyediakan WebTest.TestApp."""
    return TestApp(pyramid_app_for_session)


@pytest.fixture
def dbsession(initialized_db_for_session, pyramid_app_for_session): # test_settings tidak langsung dipakai di sini
    """
    Menyediakan database session per tes, dengan transaction handling.
    """
    engine = initialized_db_for_session 
    session_factory = get_session_factory(engine) 
    
    tm = transaction.manager 
    session = get_tm_session(session_factory, tm) 
    tm.begin()
    
    yield session 
    
    if tm.get().status == 'Active': 
        try:
            tm.abort()
        except Exception as e:
            print(f"Error during dbsession abort: {e}") 
    session.close()


@pytest.fixture
def admin_token(testapp, dbsession, test_settings): 
    """
    Mendapatkan token JWT untuk user 'admin1'.
    Akan membuat user 'admin1' jika belum ada di database tes.
    """
    admin_username = 'admin1'
    admin_password = 'admin123' 

    user = dbsession.query(Users).filter_by(username=admin_username).first()
    
    if not user:
        print(f"[admin_token] User '{admin_username}' tidak ditemukan, membuat user baru untuk tes...")
        new_admin = Users(username=admin_username, role='admin')
        new_admin.set_password(admin_password) 
        dbsession.add(new_admin)
        try:
            transaction.manager.commit() 
            print(f"[admin_token] User '{admin_username}' berhasil dibuat dan di-commit.")
        except Exception as e:
            transaction.manager.abort() 
            pytest.fail(f"[admin_token] Gagal membuat dan commit user '{admin_username}' untuk tes: {e}")
        finally:
            transaction.manager.begin()
            # Setelah commit dan begin baru, query ulang user untuk memastikan ada di sesi saat ini
            # dan passwordnya benar
            user = dbsession.query(Users).filter_by(username=admin_username).first()
            if not user:
                pytest.fail(f"[admin_token] User '{admin_username}' TIDAK ADA di DB setelah upaya pembuatan dan commit.")
            if not user.check_password(admin_password): # Verifikasi password
                 pytest.fail(f"[admin_token] Password untuk '{admin_username}' TIDAK SESUAI setelah pembuatan.")
            print(f"[admin_token] User '{admin_username}' diverifikasi ada di DB dengan password yang benar setelah pembuatan.")


    login_payload = {'username': admin_username, 'password': admin_password}
    print(f"[admin_token] Attempting login for '{admin_username}' with password '{admin_password}'")
    res = testapp.post_json('/login', login_payload, expect_errors=True) 
    
    if res.status_code != 200:
        current_user_in_db = dbsession.query(Users).filter_by(username=admin_username).first()
        user_info_for_fail = f"User '{admin_username}' {'ada' if current_user_in_db else 'TIDAK ADA'} di DB saat login dicoba."
        if current_user_in_db:
            user_info_for_fail += f" Password di DB (hashed): {current_user_in_db.password[:20]}... "
            user_info_for_fail += f"Password check result: {current_user_in_db.check_password(admin_password)}"

        pytest.fail(
            f"[admin_token] Login sebagai '{admin_username}' gagal untuk mendapatkan token. "
            f"Status: {res.status_code}, Response: {res.text}. {user_info_for_fail}"
        )
    assert 'token' in res.json, f"[admin_token] Token tidak ditemukan dalam respons login '{admin_username}'"
    print(f"[admin_token] Token for '{admin_username}' obtained successfully.")
    return res.json['token']

@pytest.fixture
def pesanan_test_payload():
    """Menyediakan payload dasar untuk membuat pesanan."""
    return {
        "nama_pelanggan": "Pelanggan Test CRUD",
        "nomor_telepon": "081234567890",
        "kategori_layanan": "kiloan", # atau 'satuan'
        "jenis_layanan": "cuci_setrika", # sesuaikan dengan enum/pilihan yang ada
        "jumlah": 3.5, # float untuk kiloan, int untuk satuan
        "catatan": "Pesanan dari CRUD test"
    }