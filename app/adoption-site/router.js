import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import multer from 'multer';
import * as pets from '../pets.js';
import * as users from '../users.js';

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
const userTXT = path.join(__dirname, 'data', 'users.txt');

// HTTP REQUESTS

router.get('/', (req, res) => {
  const signedOut = req.query.signedOut === 'true';

  res.render('index', {
    title: 'Adopt a Pet',
    extraStylesheet: '/assets/styles/home.css',
    currentRoute: '/index',
    sessionName: req.session.username,
    signedOut: signedOut
  });
});

router.get('/accounts', (req, res) => {
  let name = req.session.username;
  
  // if they're signed in, simply sign them out.
  if (req.session.username) {
    req.session.destroy(err => {
      if (err) console.error(`Something went wrong: ${err.message}`);
      else {
        name = undefined; // prevent an error if the sign out occurs
        res.redirect('/?signedOut=true');
      }
    });

    return; // prevent render response
  }

  res.render('accounts', {
    title: "Sign in",
    extraStylesheet: '/assets/styles/accounts.css',
    extraScript: '<script type="module" src="/scripts/accounts.js"></script>',
    currentRoute: '/accounts',
    sessionName: name
  })
});

router.post('/sign-in', async (req, res) => {
  const status = users.validateSignIn(req.body);

  const target = await users.findUser(userTXT, req.body.user);
  const match = target[1] === req.body.pass;

  if (status.ok && target.length > 0 && match) {
    let username = target[0];

    // reduce the length if its too long
    if (username.length > 20)
      username = username.substring(0, 20) + '...';

    req.session.username = username;
    status.redirect = '/';
    res.json(status);
  } else {
    if (target.length === 0) { // user not found
      status.ok = false;
      status.errors.push('Account not found');
    }
    else if (!match) {
      status.ok = false;
      status.errors.push('Incorrect password.');
    }

    res.status(400).json(status);
  }
});

router.post('/create-acc', async (req, res) => {
  const status = users.validateAccountCreation(req.body);
  const nameCollision = await users.collidesUsername(userTXT, req.body.user);

  if (status.ok && !nameCollision) {
    if (users.writeUser(userTXT, req.body))
      res.json(status);
    else
      res.status(500).json({
        ok: false, 
        message: 'An error occured', 
        errors: ['A server error occured.']
      });
  } else {
    if (nameCollision) {
      status.ok = false;
      status.errors.push('Username already exists.');
    }

    res.status(400).json(status);
  }
});

router.get('/browse', async (req, res) => {
  const petListings = await pets.readPets(petJSON);

  res.render('browse', {
    title: 'Pet Browser',
    extraStylesheet: '/assets/styles/browse.css',
    currentRoute: '/browse',
    pets: petListings,
    sessionName: req.session.username
  });
});

router.get('/cat-care', (req, res) => {
  res.render('cat-care', {
    title: 'Cat Care',
    extraStylesheet: '/assets/styles/pet-care.css',
    currentRoute: '/cat-care',
    sessionName: req.session.username
  });
});

router.get('/credits', (req, res) => {
  res.render('credits', {
    title: 'Credits',
    extraStylesheet: '/assets/styles/credits.css',
    currentRoute: '/credits',
    sessionName: req.session.username
  });
});

router.get('/dog-care', (req, res) => {
  res.render('dog-care', {
    title: 'Dog Care',
    extraStylesheet: '/assets/styles/pet-care.css',
    currentRoute: '/dog-care',
    sessionName: req.session.username
  });
});

router.get('/giveaway-form', (req, res) => {
  res.render('giveaway-form', {
    title: 'Adoption Form',
    extraStylesheet: '/assets/styles/forms.css',
    extraScript: '<script type="module" src="/scripts/input-validation.js"></script>',
    currentRoute: '/giveaway-form',
    sessionName: req.session.username
  });
});

router.post('/giveaway-form', upload.single('photo'), (req, res) => {
  if (!req.session.username) {
    res.status(401).json({
      ok: false, 
      message: 'No active session',
      errors: ['You must be signed in']
    });
    return;
  }

  const newPet = req.body;
  const status = pets.validatePetListing(newPet);

  if (status.valid) {
    newPet.photo = path.join('uploads', req.file.filename);
    if (Array.isArray(newPet.behaviour))
      newPet.behaviour = newPet.behaviour.join(", ");
  
    if (pets.writePet(petJSON, newPet))
      res.json({ok: true, message: 'Listing uploaded successfully!' });
    else
      res.status(500).json({ok: false, message: 'An error occured.'});

  } else {
    // delete the photo file relating to the invalid post
    pets.deleteInvalidPhoto(path.join(__dirname, 'uploads', req.file.filename));

    res.status(400).json({ok: false, message: 'Invalid information was found. Please resubmit.', errors: status.errors })
  }
});

router.get('/pet-finder', (req, res) => {
  res.render('pet-finder', {
    title: 'Find an Adoptee',
    extraStylesheet: '/assets/styles/forms.css',
    extraScript: '<script type="module" src="/scripts/input-validation.js"></script>',
    currentRoute: '/pet-finder',
    sessionName: req.session.username
  });
});

// result of pet-finder will route HERE
router.get('/browse-filtered', async (req, res) => {
  const petListings = await pets.readPets(petJSON);

  let filteredListings = [];
  if (pets.validateQuery(req.query))
    filteredListings = petListings.filter(listing => {
      return pets.filterPetQuery(listing, req.query) 
    });

  res.render('browse', {
    title: 'Pet Browser',
    extraStylesheet: '/assets/styles/browse.css',
    currentRoute: '/browse',
    pets: filteredListings,
    tagline: `Your filtered pet search:`,
    sessionName: req.session.username
  });
});

router.get('/privacy', (req, res) => {
  res.render('privacy', {
    title: 'Privacy Policy',
    extraStylesheet: '/assets/styles/privacy.css',
    currentRoute: '/privacy',
    sessionName: req.session.username
  });
});

router.get('/*', (req, res) => {
  res.render('err', {
    title: 'Page Not Found',
    extraStylesheet: '/assets/styles/404.css',
    currentRoute: '/404',
    sessionName: req.session.username
  });
});