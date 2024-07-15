const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser'); // Add this line
const Product = require('./models/product');
const User = require('./models/user');

const jwt = require('jsonwebtoken');
const secretKey = 'my_secret_key';

mongoose.connect('mongodb://127.0.0.1:27017/Products')
    .then(() => {
        console.log("connection open");
    })
    .catch(err => {
        console.log('on no error');
        console.log(err);
    });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser()); // Add this line

const categories = ['fruit', 'vegetable', 'dairy'];

function auth(req, res, next) {
    const token = req.cookies.token; // Get token from cookies
    if (!token) {
        res.redirect('/login')
        console.log('No token, authorization denied' )
        // return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.redirect('/login')
        console.log('Token is not valid' )
        // res.status(401).json({ msg: 'Token is not valid' });
    }
}

app.get('/alldata', async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (error) {
        res.status(500).send('Error retrieving users: ' + error.message);
    }
});

app.get('/signup', (req, res) => {
    res.render('users/signup');
});

app.post('/signup', async (req, res) => {
    try {
        const user = new User(req.body);
        console.log(user);
        await user.save();

        const token = jwt.sign({ userId: user._id, email: user.email }, secretKey, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });

        res.redirect('/products');
    } catch (error) {
        console.error(error);
        res.redirect('/signup')
    }
});

app.get('/', (req, res) => {
    res.render('home');
});
app.get('/login', (req, res) => {
    res.render('users/login');
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
        res.redirect('/signup')
        return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
        user: {
            id: user.id,
            email: user.email,
        }
    };

    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // Set token in cookies
    res.redirect('/products');
});

app.get('/products',auth, async (req, res) => {
    const products = await Product.find({})
    res.render('products/index', { products })
})

app.post('/products',auth,  async (req, res) => {
    const post = new Product(req.body)
    console.log(post);
    await Product.insertMany(post);
    res.redirect('/products/')
})

app.get('/products/new',auth,  (req, res) => {
    res.render('products/new', {})
})

app.get('/products/:id',auth,  async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id)
    console.log(product);
    res.render('products/show', { product })
})

app.get('/products/:id/edit',auth,  async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id)
    res.render('products/edit', { product, categories })
})

app.put('/products/:id',auth,  async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true })
    res.redirect(`/products/${product._id}`)
})

app.delete('/products/:id',auth,  async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id)
    res.redirect('/products')
})

app.listen(3000, () => {
    console.log('app is listening on port 3000')
})