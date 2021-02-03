const express =  require('express');
const app = express();
const mongoose =  require('mongoose');
const ShortUrl = require('./models/url');

app.use(express.json());
app.set('views','./views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

//GET api
app.get('/', async(req,res) => {
    const allData = await ShortUrl.find();
    res.render('index',{ shortUrls: allData });
});

//GET api using shortid
app.get('/:shortid',async (req,res) => {
    //grabbing the shortid param
    const shortid = req.params.shortid;

    //perform the mongoose call to find the long URL
    const rec =  await ShortUrl.findOne({ short: shortid });

    //if null, setting the status to 404 
    if(!rec) return res.sendStatus(404);

    //if not null, incerementing the click count in database
    rec.clicks++;
    await rec.save();

    //redirecting the user to original link
    res.redirect(rec.full);
});

//POST api
app.post('/short', async (req, res) => {
    const fullUrl = req.body.fullUrl;
    console.log('URL requested: ',fullUrl);
    const record = new ShortUrl({
        full: fullUrl
    });
    await record.save();
	res.redirect('/');
});

//mongoose connection
mongoose.connect('mongodb://localhost:27017/urlShortener',{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
 .then(() => console.log('Connected to MongoDB...'))
 .catch( err => console.error('Could not connect to MongoDB...'));

//port
mongoose.connection.on('open', () => {
    const port = process.env.PORT || 8080;
	app.listen(port, () => {
		console.log(`Connected to port ${port}...`);
	});
});