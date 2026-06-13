import psycopg2

db_url = "postgresql://neondb_owner:npg_bU1TCIt9QYuA@ep-late-cell-apg81iyw-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

print("Connecting to:", db_url)
try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT 1;")
    print("Success! Result:", cur.fetchone())
    cur.close()
    conn.close()
except Exception as e:
    print("Database connection failed!")
    print(e)
