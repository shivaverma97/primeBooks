const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const { render } = require('ejs')
const mongoose = require('mongoose')
const imageMimeTypes = ['image/jpg', 'image/jpeg', 'image/png']

router.get('/', async (req, res) => {

    try{

        let query = Book.find()

        if(req.query.title != null && req.query.title != ''){
            query = query.regex('title', new RegExp(req.query.title, 'i'))
        }
        if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
            query = query.gte('publishDate', req.query.publishedAfter)
        }
        if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
            query = query.lte('publishDate', req.query.publishedBefore)
        }

        const books = await query.exec()
        
        res.render('books/index', {
            books : books,
            searchOptions : req.query
        })
    }
    catch(err){
        console.error(err)
    }

})

router.get('/new', async (req, res) => {
    RenderNewPage(res, new Book())
})

router.post('/', async (req, res) => {

    const book = new Book({ 
        title : req.body.title,
        author : mongoose.mongo.ObjectId(req.body.author),
        publishDate : new Date(req.body.publishDate),
        pageCount : req.body.pageCount,
        description : req.body.description
    })
    
    SaveBookCover(book, req.body.cover)
    
    try{
        const newBook = await book.save()
        res.redirect(`books`)
    }
    catch (e) {  
        RenderNewPage(res, book, true, e)
    }
})

router.get('/:id', async (req, res) => {
    let book 

    try{
        book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show', {
            book: book
        })
    }
    catch(ex){
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id)
        RenderEditPage(res, book)
    }
    catch(ex){
        res.redirect('/')
    }
})

router.put('/:id', async (req, res) => {

    const book = await Book.findById(req.params.id)
      
    book.title = req.body.title
    book.author = mongoose.mongo.ObjectId(req.body.author)
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    
    SaveBookCover(book, req.body.cover)
    
    try{
        await book.save()
        res.redirect(`/books/${req.params.id}`)
    }
    catch (e) {  
        if (book != null) RenderEditPage(res, book, true, e)
        else res.redirect('/')
    }
})

router.delete('/:id', async (req, res) => {
    let book

    try{
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    }
    catch(ex){
        console.error(ex)
        if (book == null) res.redirect('/books')
        else res.redirect('/')
    }
})

async function RenderNewPage(res, book, hasError = false){
    RenderFormPage(res, book, 'new', hasError)
}   

async function RenderEditPage(res, book, hasError = false){
    RenderFormPage(res, book, 'edit', hasError)
}   

async function RenderFormPage(res, book, form, hasError = false){
    try{
        const authors = await Author.find({})
        const params = {
            authors : authors,
            book : book
        }

        if (hasError){
            if(form == 'edit') params.errorMessage = 'Error updating the book'
            else params.errorMessage = 'Failed creating a new book'
        } 
        res.render(`books/${form}`, params)
    }
    catch{
        res.redirect(`/books`)
    }
} 

function SaveBookCover(book, covereEncoded){
    if(covereEncoded == null) return
    
    const cover = JSON.parse(covereEncoded)

    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router 