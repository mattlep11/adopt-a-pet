import { Router } from "express";
export const router = new Router();

router.get("/", (req, res) => {
  res.render('index', {
    title: "Adopt a Pet",
    extraStylesheet: "/assets/styles/home.css",
    currentRoute: "/index"
  });
});
router.get("/browse", (req, res) => {
  res.render('browse', {
    title: "Pet Browser",
    extraStylesheet: "/assets/styles/browse.css",
    extraScript: '<script async src="/scripts/populate-browser.js"></script>',
    currentRoute: "/browse"
  });
});
router.get("/cat-care", (req, res) => {
  res.render('cat-care', {
    title: "Cat Care",
    extraStylesheet: "/assets/styles/pet-care.css",
    currentRoute: "/cat-care"
  });
});
router.get("/contact", (req, res) => {
  res.render('contact', {
    title: "Contact Us!",
    extraStylesheet: "/assets/styles/contact.css",
    currentRoute: "/contact"
  });
});
router.get("/credits", (req, res) => {
  res.render('credits', {
    title: "Credits",
    extraStylesheet: "/assets/styles/credits.css",
    currentRoute: "/credits"
  });
});
router.get("/dog-care", (req, res) => {
  res.render('dog-care', {
    title: "Dog Care",
    extraStylesheet: "/assets/styles/pet-care.css",
    currentRoute: "/dog-care"
  });
});
router.get("/giveaway-form", (req, res) => {
  res.render('giveaway-form', {
    title: "Adoption Form",
    extraStylesheet: "/assets/styles/forms.css",
    extraScript: '<script defer src="/scripts/input-validation.js"></script>',
    currentRoute: "/giveaway-form"
  });
});
router.get("/pet-finder", (req, res) => {
  res.render('pet-finder', {
    title: "Find an Adoptee",
    extraStylesheet: "/assets/styles/forms.css",
    extraScript: '<script defer src="/scripts/input-validation.js"></script>',
    currentRoute: "/pet-finder"
  });
});
router.get("/privacy", (req, res) => {
  res.render('privacy', {
    title: "Privacy Policy",
    extraStylesheet: "/assets/styles/privacy.css",
    currentRoute: "/privacy"
  });
});