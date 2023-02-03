const express = require('express')
const router = express.Router()
const Book = require('../models/book')

router.get('/', async (req, res) => {
    try{
        const recentlyAddedBooks = await  Book.find().sort({createdAt : 'desc'}).limit(10).exec();
        res.render('', {
            books : recentlyAddedBooks
        })
    }
    catch(ex){
        console.error(ex)
    }
})


module.exports = router