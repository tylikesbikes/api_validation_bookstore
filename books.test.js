process.env.NODE_ENV = 'test';

const app = require('./app');
const db = require('./db')
const request = require('supertest');

beforeEach(async () => {
    await request(app).post('/books')
        .send({
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "M. Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
          });
})

test('get list of books', async () => {
    const res = await request(app).get('/books');
    expect(res.statusCode).toEqual(200);
    expect(res.body.books).toHaveLength(1);
    expect(res.body.books[0].pages).toEqual(264);
    // console.log(res);
})

test('get single book by isbn', async () => {
    const res = await request(app).get('/books/0691161518');
    expect(res.statusCode).toEqual(200);
    expect(res.body.book).toHaveProperty('year');
    expect(res.body.book.author).toEqual('M. Lane');
})

test('create new book with valid json', async () => {
    const res = await request(app).post('/books')
        .send({
            "isbn": "0691161519",
            "amazon_url": "http://t.est",
            "author": "Testy McTest",
            "language": "english",
            "pages": 300,
            "publisher": "Ptown Press",
            "title": "TestBook",
            "year": 2017
          });
    expect(res.statusCode).toEqual(201);
    expect(res.body.book.year).toEqual(2017);
    // console.log(res);
})

test('successfully delete a book', async () => {
    const res = await request(app).delete('/books/0691161518');
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Book deleted');
})

test('404 when isbn not found trying to delete a book', async () => {
    const res = await request(app).delete('/books/234');
    expect(res.statusCode).toEqual(404);
})

test('prevents creating new book with bad json (pages isn\'t a number)', async () => {
    const res = await request(app).post('/books')
        .send({
            "isbn": "0691161519",
            "amazon_url": "http://t.est",
            "author": "Testy McTest",
            "language": "english",
            "pages": '300',
            "publisher": "Ptown Press",
            "title": "TestBook",
            "year": 2017
          });
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors[0]).toEqual("instance.pages is not of a type(s) integer");
})



afterEach(async () => {
   await db.query(`DELETE FROM books`)
})

afterAll(async () => {
    await db.end();
})