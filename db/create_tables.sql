create table books (
	id integer primary key,
	title varchar(120),
	isbn varchar(16),
	page_count integer,
	published_date timestamptz,
	thumbnail_url text,
	short_description text,
	long_description text,
	status varchar(16)
);

create table authors (
	id integer primary key,
	name varchar(120)
);

create table categories (
	id integer primary key,
	name varchar(60)
);

create table books_authors (
	book_id integer references books(id),
	author_id integer references authors(id)
);

create table books_categories (
	book_id integer references books(id),
	category_id integer references categories(id)
);

create table users (
	id serial primary key,
	name varchar(255),
	email varchar(255),
	password_hash varchar(255)
);

create table user_books (
	user_id integer references users(id),
	book_id integer references books(id),
	status varchar(60),
	rating integer,
	review text
);

create table user_follows (
	user_id integer references users(id),
	followed_id integer references users(id)
);