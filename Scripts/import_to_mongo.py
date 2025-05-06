import csv
import pymongo
from datetime import datetime

# Connect to MongoDB (running in Docker)
client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['logindb']

# List of tables/collections
collections = ['task_log', 'user_sticker', 'sticker_history', 'rating', 'user', 'sticker', 'alembic_version']

# Function to convert SQLite data to MongoDB format
def transform_row(row, table):
    transformed = {k: v for k, v in row.items() if v is not None}  # Remove NULL values
    if table == 'user':
        transformed['is_admin'] = bool(int(transformed['is_admin'])) if transformed['is_admin'] else False
    elif table == 'user_sticker':
        transformed['collected'] = bool(int(transformed['collected'])) if transformed['collected'] else False
        transformed['favorite'] = bool(int(transformed['favorite'])) if transformed['favorite'] else False
    elif table in ['task_log', 'sticker_history', 'rating']:
        for field in ['created_at', 'updated_at', 'change_date']:
            if field in transformed and transformed[field]:
                try:
                    transformed[field] = datetime.strptime(transformed[field], '%Y-%m-%d %H:%M:%S.%f')
                except ValueError:
                    transformed[field] = datetime.strptime(transformed[field], '%Y-%m-%d %H:%M:%S')
    return transformed

# Import each CSV into MongoDB
for collection in collections:
    db[collection].drop()  # Clear existing data (optional)
    try:
        with open(f'{collection}.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            documents = [transform_row(row, collection) for row in reader]
            if documents:
                db[collection].insert_many(documents)
                print(f"Imported {len(documents)} documents into {collection}")
    except FileNotFoundError:
        print(f"CSV file for {collection} not found, skipping...")

client.close()