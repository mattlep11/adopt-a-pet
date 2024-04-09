import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import multer from 'multer';
import * as data from '../data.js';

export const router = new Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// saving accepted files to disk with a specific file name, retaining extension
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '/uploads/'));
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

// upload middleware by multer, allows files to be filtered out and stored
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: function(req, file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mime = fileTypes.test(file.mimetype);
    const ext = fileTypes.test(path.extname(file.originalname).toLowerCase());

    // test correct MIMEtype and file extension to accept
    if (mime && ext)
      return cb(null, true);

    return cb(null, false);
  } 
});

const petJSON = path.join(__dirname, 'data', 'pet_information.json');

// HTTP REQUESTS

router.get('/', (req, res) => {
  res.render('index', {
    title: 'Adopt a Pet',
    extraStylesheet: '/assets/styles/home.css',
    currentRoute: '/index'
  });
});

router.get('/accounts', (req, res) => {
  res.render('accounts', {
    title: "Sign in",
    extraStylesheet: '/assets/styles/accounts.css',
    extraScript: '<script defer src="/scripts/accounts.js"></script>',
    currentRoute: '/accounts'
  })
});

router.get('/browse', async (req, res) => {
  const petListings = await data.getPetListing(petJSON);

  res.render('browse', {
    title: 'Pet Browser',
    extraStylesheet: '/assets/styles/browse.css',
    currentRoute: '/browse',
    pets: petListings
  });
});

router.get('/cat-care', (req, res) => {
  res.render('cat-care', {
    title: 'Cat Care',
    extraStylesheet: '/assets/styles/pet-care.css',
    currentRoute: '/cat-care'
  });
});

router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact Us!',
    extraStylesheet: '/assets/styles/contact.css',
    currentRoute: '/contact'
  });
});

router.get('/credits', (req, res) => {
  res.render('credits', {
    title: 'Credits',
    extraStylesheet: '/assets/styles/credits.css',
    currentRoute: '/credits'
  });
});

router.get('/dog-care', (req, res) => {
  res.render('dog-care', {
    title: 'Dog Care',
    extraStylesheet: '/assets/styles/pet-care.css',
    currentRoute: '/dog-care'
  });
});

router.get('/giveaway-form', (req, res) => {
  res.render('giveaway-form', {
    title: 'Adoption Form',
    extraStylesheet: '/assets/styles/forms.css',
    extraScript: '<script defer src="/scripts/input-validation.js"></script>',
    currentRoute: '/giveaway-form'
  });
});

router.post('/giveaway-form', upload.single('photo'), (req, res) => {
  const newPet = req.body;
  const status = data.validatePetListing(newPet);

  if (status.valid) {
    newPet.photo = path.join('uploads', req.file.filename);
    if (Array.isArray(newPet.behaviour))
      newPet.behaviour = newPet.behaviour.join(", ");
  
    data.writePetListing(petJSON, newPet);
    res.json({ok: true, message: 'Listing uploaded successfully!' });

  } else {
    // delete the photo file relating to the invalid post
    data.deleteInvalidPhoto(path.join(__dirname, 'uploads', req.file.filename));

    res.status(400).json({ok: false, message: 'Invalid information was found. Please resubmit.', errors: status.errors })
  }
});

router.get('/pet-finder', (req, res) => {
  res.render('pet-finder', {
    title: 'Find an Adoptee',
    extraStylesheet: '/assets/styles/forms.css',
    extraScript: '<script defer src="/scripts/input-validation.js"></script>',
    currentRoute: '/pet-finder'
  });
});

// result of pet-finder will route HERE
router.get('/browse-filtered', async (req, res) => {
  const petListings = await data.getPetListing(petJSON);
  
  const filteredListings = petListings.filter(listing => {
    return data.filterPetQuery(listing, req.query) 
  });

  res.render('browse', {
    title: 'Pet Browser',
    extraStylesheet: '/assets/styles/browse.css',
    currentRoute: '/browse',
    pets: filteredListings,
    tagline: `Your filtered pet search:`
  });
});

router.get('/privacy', (req, res) => {
  res.render('privacy', {
    title: 'Privacy Policy',
    extraStylesheet: '/assets/styles/privacy.css',
    currentRoute: '/privacy'
  });
});

router.get('/*', (req, res) => {
  res.render('err', {
    title: 'Page Not Found',
    extraStylesheet: '/assets/styles/404.css',
    currentRoute: '/404'
  });
});