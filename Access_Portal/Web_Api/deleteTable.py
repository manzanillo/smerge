import argparse
import sqlite3

parser = argparse.ArgumentParser(description='Controls the whole API server')
parser.add_argument('--delete-table', '-d', type=str, help='Delete the specified table.')

con = sqlite3.connect("instance/local.sqlite3")
cur = con.cursor()

def delete_table(table_name):
    try:
        cur.execute(f"DROP TABLE IF EXISTS {table_name}")
        con.commit()
        print(f'Table {table_name} has been deleted.')
    except sqlite3.Error as e:
        print(f'Error deleting table {table_name}: {e}')

if __name__ == '__main__':
    args = parser.parse_args()
    if args.delete_table:
        delete_table(args.delete_table)

    cur.close()