import json
from sqlalchemy import create_engine
import pandas as pd

file = open('amazon.books.json')

data = json.load(file)

books = []
authors = {}
categories = {}

books_authors = []
books_categories = []

author_id = 1
category_id = 1

for key, value in data[0].items():
    print(key, type(value))

for book in data[:300]:

    book_id = book.get('_id')
    title = book.get('title')
    isbn = book.get('isbn')
    pageCount = book.get('pageCount')
    try:
        publishedDate = book.get('publishedDate').get('$date')[:10]
    except:
        publishedDate = None
    thumbnailUrl = book.get('thumbnailUrl')
    shortDescription = book.get('shortDescription')
    longDescription = book.get('longDescription')
    status = book.get('status')

    books.append((
        book_id,
        title,
        isbn,
        pageCount,
        publishedDate,
        thumbnailUrl,
        shortDescription,
        longDescription,
        status
    ))

    for author in book.get('authors'):
        if author not in authors.keys():
            authors[author] = author_id
            author_id += 1
        books_authors.append((
            book_id,
            authors.get(author)
        ))

    for category in book.get('categories'):
        if category not in categories.keys():
            categories[category] = category_id
            category_id += 1
        books_categories.append((
            book_id,
            categories.get(category)
        ))

engine = create_engine(
    "postgresql://postgres:postgres@localhost:5432/books"
)

df = pd.read_json('amazon.books.json')[:300]
df['publishedDate'] = pd.json_normalize(df.publishedDate)
df['publishedDate'] = pd.to_datetime(df.publishedDate)
df.rename(columns={'_id': 'id', 'pageCount': 'page_count', 'publishedDate': 'published_date', 'thumbnailUrl': 'thumbnail_url',
          'shortDescription': 'short_description', 'longDescription': 'long_description'}, inplace=True)
df.dtypes

df.iloc[:, :9].to_sql(name='books', con=engine,
                      index=False, if_exists='append')

au = pd.DataFrame(authors.items()).rename(
    columns={0: 'name', 1: 'id'})[['id', 'name']]
au.to_sql(name='authors', con=engine, index=False, if_exists='append')

cat = pd.DataFrame(categories.items()).rename(
    columns={0: 'name', 1: 'id'})[['id', 'name']]
cat.to_sql(name='categories', con=engine, index=False, if_exists='append')

ba = pd.DataFrame(books_authors).rename(columns={0: 'book_id', 1: 'author_id'})
ba.to_sql(name='books_authors', con=engine, index=False, if_exists='append')

bc = pd.DataFrame(books_categories).rename(
    columns={0: 'book_id', 1: 'category_id'})
bc.to_sql(name='books_categories', con=engine, index=False, if_exists='append')
