import sqlite3 as sl
import bcrypt

con = sl.connect('local.db')

if __name__ == "__main__":
    cur = con.cursor()
    # Create a table
    #cur.execute("CREATE TABLE user(username, password)")
    
    #salt = bcrypt.gensalt()
    #hashed_password = bcrypt.hashpw("1234".encode('utf-8'), salt)
    #print(hashed_password)
    
    # Add one entry or more to table
    #cur.execute(f'Insert into user values (False, "Test", {hashed_password})')
    
    #insert_query = "INSERT INTO user VALUES (?,?,?)"
    #cur.execute(insert_query, (False, "Test", hashed_password))
    #cur.execute("""
    #INSERT INTO user VALUES
    #    ('Test', '1234')
    #""")
    #con.commit()
    
    #res = cur.execute("select * from user")
    #print(res.fetchall())
    #con.execute("delete from user where username IS NULL;")
    #con.commit()
    
    # get number of entries where username == Test1
    #res = con.execute("SELECT COUNT(*) FROM user WHERE username = 'Test1';")
    #print(res.fetchone()[0])
    
    # Add a column to the db
    #con.execute("Alter table user add isAdmin bool;")
    #con.execute("Alter table user add password binary(60);")
    
    
    
    #bcrypt_hash_str = "$2b$12$kkBpAJcOynJukvqXYweXJuOGBb4P9FGW1xfNqV8aqUAOBJn2q5Cia"
    #binary_length = len(hashed_password)

    #print("Binary Length:", binary_length, "bytes")
    
    # Remove a column from the db
    #con.execute("Alter table user drop column password;")
    
    con.close()