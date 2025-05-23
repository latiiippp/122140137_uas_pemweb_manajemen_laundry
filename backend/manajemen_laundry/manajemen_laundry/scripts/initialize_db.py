import argparse
import sys
from datetime import date

from pyramid.paster import bootstrap, setup_logging
from sqlalchemy.exc import OperationalError

from .. import models


def setup_models(dbsession):
    """
    Add initial model objects.
    """
    admin_exists = dbsession.query(models.Users).filter_by(username='admin1').first()
    if not admin_exists:
        admin1 = models.Users(
            username='admin1',
            role='admin'
        )
        admin1.set_password('admin123')
        dbsession.add(admin1)
        print("Admin user 'admin1' created.")
    else:
        print("Admin user 'admin1' already exists.")
        
    karyawan_exists = dbsession.query(models.Users).filter_by(username='karyawan1').first()
    if not karyawan_exists:
        karyawan1 = models.Users( 
            username='karyawan1',
            role='karyawan'
        )
        karyawan1.set_password('karyawan123')
        dbsession.add(karyawan1)
        print("Employee user 'karyawan1' created.")
    else:
        print("Employee user 'karyawan1' already exists.")




def parse_args(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument(
        'config_uri',
        help='Configuration file, e.g., development.ini',
    )
    return parser.parse_args(argv[1:])


def main(argv=sys.argv):
    args = parse_args(argv)
    setup_logging(args.config_uri)
    env = bootstrap(args.config_uri)

    try:
        with env['request'].tm:
            dbsession = env['request'].dbsession
            setup_models(dbsession)
    except OperationalError:
        print('''
Pyramid is having a problem using your SQL database.

Your database should be up and running before you
initialize your project. Make sure your database server
is running and your connection string in development.ini
is correctly configured.
''')


if __name__ == '__main__':
    main()