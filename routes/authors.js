const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')

router.get('/', async (req, res) => {

    let searchOptions = {}
    
    if(req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')  // i for case insensitive
    }

    try{
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors : authors,
            searchOptions : req.query
        })
    }
    catch{
        res.render('/', {
            errorMessage: 'Error getting all authors'
        })
    }
})

router.get('/new', (req, res) => {
    res.render('authors/new', { author : new Author()})     // added model schema for author
})

router.post('/', async (req, res) => {
    const author = new Author({
        name : req.body.name
    })
    try{
        const newAuthor = await author.save()
        res.redirect('authors')
    }
    catch{
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating new author'
        })
    }
})

router.get('/:id', async (req, res) => {
    let authorBooks 
    let author 

    try{
        author = await Author.findById(req.params.id)
        authorBooks = await Book.find({author : req.params.id})
        res.render('authors/show', {
            author : author,
            books : authorBooks 
        })
    }
    catch(ex){
        if(author == null ) console.error("Author is null")
        else if (authorBooks == null ) console.error("books are null")
        else console.error(ex)
    }
})

router.get('/:id/edit', async (req, res) => {
    try{
        const author = await Author.findById(req.params.id)
        res.render('authors/edit',{
            author: author
        })
    }
    catch (ex){
        console.error(ex)
    }
})

router.put('/:id', async (req, res) => {
    let author
    try{
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${req.params.id}`)
    }
    catch(ex){
        if (author == null) res.redirect('/')
        else{
            res.render('authors/edit', {
                author: author,
                errorMessage: `Error updating the author due to the following exception: ${ex}`
            })
        }
    }
})

router.delete('/:id', async (req, res) => {
    let author

    try{
        author = await Author.findById(req.params.id)
        await author.remove()
        res.redirect('/authors')
    }
    catch(ex){
        if (author == null) res.redirect('/')
        res.redirect(`/authors/${req.params.id}`) 
    }
})


module.exports = router 