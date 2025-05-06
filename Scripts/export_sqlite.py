import sqlite3
import csv

conn = sqlite3.connect('C:/Users/mclda/Documents/Projects/StickerAlbum/instance/site.db')
cursor = conn.cursor()

# List of tables to export
tables = ['task_log', 'user_sticker', 'sticker_history', 'rating', 'user', 'sticker', 'alembic_version']

# Export each table to a CSV file
for table in tables:
    cursor.execute(f"SELECT * FROM {table}")
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    
    with open(f'{table}.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow(dict(zip(columns, row)))

conn.close()