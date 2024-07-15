const mongoose = require('mongoose')
const Product = require('./models/product');

mongoose.connect('mongodb://127.0.0.1:27017/Products')
        .then(()=>{
            console.log("connection open")
        })
        .catch(err=>{
            console.log('on no error')
            console.log(err)
        })

const seedProducts=[
    {
        name:'fairy eggplant',
        price: 1.00,
        category: 'vegetable'
    },
    {
        name:'organic goddess melon',
        price: 4.99,
        category: 'fruit'
    },
    {
        name:'organic mini seedless watermelon',
        price: 3.99,
        category: 'fruit'
    },
    {
        name:'organic celery',
        price: 1.50,
        category: 'vegetable'
    },
    {
        name:'chocolate whole milk',
        price: 2.69,
        category: 'dairy'
    },
]
Product.insertMany(seedProducts)
    .then(res=>{
        console.log(res)
    })
    .catch(e=>{
        console.log(e)
    })