const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));


mongoose.connect(process.env.MONGO_URL)
.then(()=>{
  console.log("Database connected succesfully");
})
.catch((err)=>{
  console.log("Error occured while Database connection", err);
})


const blogSchema = new mongoose.Schema({
  title: {
    type: String
  },
  description: String,
  imageURL: String
});

const Blog = new mongoose.model("Blog", blogSchema);


const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String
});

const ContactModel = new mongoose.model('Contact', contactSchema);

app.get('/', (req, res) => {

  Blog.find({})
    .then((posts) => {
      res.render("index", {blogPosts: posts})
    })
    .catch((err) => {
      console.log("Error getting data", err);
      res.redirect("/");
    });
});


app.get('/compose', (req, res)=>{
  res.render('compose')
})

app.post('/compose', (req, res)=>{
  const title = req.body.title;
  const image = req.body.imageUrl;
  const description = req.body.description;

  const newBlog = new Blog({
    imageURL: image,
    title: title,
    description: description,
  })

  newBlog.save()
  .then(()=>{
    console.log("New Blog Posted");
  })
  .catch((err)=>{
    console.log("Error posting New Blog");
  });

  res.redirect('/');
})

app.get('/post/:id', (req, res)=>{

  const reqID = req.params.id;

  // console.log(reqID);

  Blog.findOne({ _id: reqID })
    .then((post) => {
      res.render("post", { title: post.title, description: post.description, imageURL: post.imageURL});
    })
    .catch((err) => {
      console.log("Post Not Found");
      res.redirect("/");
    });
})

app.post("/contact", async (req, res)=>{
  try {
    const {name, email, message} = req.body;

    const newContact = new ContactModel({
      name,
      email,
      message
    })

    await newContact.save();

    res.redirect('/');
  } catch (error) {
    console.log("Error saving contact: ", error)
    res.redirect('/');
  }
})



app.get('/post/delete/:id', (req, res)=>{
  const idToRemove = req.params.id;

  Blog.findByIdAndDelete(idToRemove)
    .then((removedPost) => {
      if (removedPost) {
        console.log("Post Deleted:", removedPost);
      } else {
        console.log("Post Not Found");
      }
    })
    .catch((err) => {
      console.log("Error deleting post:", err);
    });

    res.redirect('/');
})


app.get('/about', (req, res)=>{
  res.render('about');
})

app.get('/contact', (req, res)=>{
  res.render('contact');
})


app.listen(3000, ()=>{
  console.log("Server Listening on port 3000");
});