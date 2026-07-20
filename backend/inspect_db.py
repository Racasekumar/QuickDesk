import sqlite3

def inspect_db():
    conn = sqlite3.connect("quickdesk.db")
    cursor = conn.cursor()
    
    # 1. Get list of tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in cursor.fetchall()]
    print("=== TABLES IN DATABASE ===")
    for table in tables:
        print(f"- {table}")
    print()

    # 2. Inspect users table schema and content
    if "users" in tables:
        print("=== USERS SCHEMA ===")
        cursor.execute("PRAGMA table_info(users);")
        for col in cursor.fetchall():
            print(f"Col {col[0]}: {col[1]} ({col[2]}) {'PK' if col[5] else ''}")
        print()

        print("=== REGISTERED USERS ===")
        cursor.execute("SELECT id, full_name, email, role, created_at FROM users;")
        rows = cursor.fetchall()
        if not rows:
            print("(No users registered yet)")
        for row in rows:
            print(f"ID: {row[0]} | Name: {row[1]} | Email: {row[2]} | Role: {row[3]} | Created: {row[4]}")
        print()
    else:
        print("users table does not exist!")

    # 3. Inspect tickets table schema
    if "tickets" in tables:
        print("=== TICKETS SCHEMA ===")
        cursor.execute("PRAGMA table_info(tickets);")
        for col in cursor.fetchall():
            print(f"Col {col[0]}: {col[1]} ({col[2]})")
        print()
        
        cursor.execute("SELECT COUNT(*) FROM tickets;")
        print(f"Total tickets: {cursor.fetchone()[0]}")
    
    conn.close()

if __name__ == "__main__":
    inspect_db()
