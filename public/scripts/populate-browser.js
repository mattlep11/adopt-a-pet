const PLACEHOLDER_ENTRIES = [
  {
    type: "cat",
    name: "Fitzgerald",
    photo: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2Fa1%2Fad%2Fb5%2Fa1adb5f5fd176758d32953e904abddb1.jpg&f=1&nofb=1&ipt=9429f4f21907ee9ed2a34ce4e51016aaf89327bb6ef926db3337eb96f93adf85&ipo=images",
    breed: "Silly",
    age: "<1",
    gender: "Male",
    "gets-along-with": ["None"],
    desc: "Violated the Geneva Convention in 2008."
  },
  {
    type: "dog",
    name: "Malcolm",
    photo: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fc.tenor.com%2Fs8mNCfzjhpYAAAAC%2Fpropeller-hat.gif&f=1&nofb=1&ipt=4a2ff6be208113329924644f61affd69b0ed62e7b1250d76690c7bd5938c6ee6&ipo=images",
    breed: "Propeller Hat",
    age: "8+",
    gender: "Male",
    "gets-along-with": ["Dogs"],
    desc: "Thinks life is all just fun and games..."
  },
  {
    type: "cat",
    name: "Fitzgerald II",
    photo: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2Fa1%2Fad%2Fb5%2Fa1adb5f5fd176758d32953e904abddb1.jpg&f=1&nofb=1&ipt=9429f4f21907ee9ed2a34ce4e51016aaf89327bb6ef926db3337eb96f93adf85&ipo=images",
    breed: "Silly",
    age: "<1",
    gender: "Male",
    "gets-along-with": ["None"],
    desc: "Who let a second Fitzgerald into the adoption centre?? 😭"
  },
  {
    type: "cat",
    name: "Shower Cat",
    photo: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.imgur.com%2FFgNFFLt.jpg&f=1&nofb=1&ipt=8700a4f4e00f2313f1d060273e94aa7b906ed36e350e3a36ddfe882339b5f254&ipo=images",
    breed: "Black",
    age: "4",
    gender: "Female",
    "gets-along-with": ["Cats", "Dogs"],
    desc: "Apparently this one isn't even up for adoption?"
  }
];
/*
* Temporary objects that are used to populate the browse.html page. In the 
* future, a backend will be connected and will create new entries based on 
* what has been submitted through the form. For now, the profile pictures
* are connected via hotlinking to a website. See credits page for sources. 
*/

const TEMPLATE = document.getElementById("pet-template");
const ROOT = document.getElementById("content-wrapper");
/* 
* As frameworks are not being used in this project, below is a method that
* uses the template element in the browser document to quickly create the
* content needed for each pet listing. 
*/
function appendPetProfile(petDetails) {
  const clone = TEMPLATE.content.cloneNode(true);
  const profile = clone.querySelector(".pet-profile");

  // configure the pet's image
  let petPicture = profile.getElementsByTagName("img")[0];
  petPicture.src = petDetails.photo;
  petPicture.alt = "An adoption listing photo for a " 
    + petDetails.type + " named " + petDetails.name;

  // 0: name, 1: Gender/Age, 2: Gets Along With, 3: Breed, 4: description
  let pElements = profile.getElementsByTagName("p");
  
  pElements[0].textContent = petDetails.name;
  
  let stats = pElements[1].textContent;
  stats = stats.replace("GENDER", petDetails.gender);
  pElements[1].textContent = stats.replace("AGE", petDetails.age) + " yrs old";

  // Appending text nodes to avoid any vulnerabilities (this is u-inputted data)
  let behavioural = document.createTextNode(petDetails["gets-along-with"].join(", "));
  pElements[2].appendChild(behavioural);

  let breed = document.createTextNode(petDetails.breed);
  pElements[3].appendChild(breed);

  pElements[4].textContent = petDetails.desc;

  ROOT.appendChild(profile);
}

PLACEHOLDER_ENTRIES.forEach(pet => appendPetProfile(pet));
