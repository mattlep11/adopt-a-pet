import fs from 'node:fs';

// writes a new pet into the petJSON
function writePetListing(path, newPet) {
  const listings = getPetListing(path);
  listings.then(response => {
    response.push(newPet);
    
    fs.writeFile(path, JSON.stringify(response), err => {
      if (err) console.error(`Failed to write file: ${err.message}`);
      console.log("Saved pet listings successfully");
    })
  });
}

// returns the pet listings from the file as an array of objects
function getPetListing(path) {
  return new Promise((res, rej) => {
    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) {
        console.error(`Failed to read file: ${err.message}`);
        res([]); // return an empty array for failed reads
      }

      res(JSON.parse(data));
    });
  });
}

// deletes a photo after a failed POST request to giveaway
function deleteInvalidPhoto(filename) {
  fs.unlink(filename, err => {
    if (err) console.error(`Failed to delete file: ${err.message}`);
  });
}

// returns true if the pet info is submitted properly
// simply verifies: the fields aren't blank, the age isn't negative, the email 
// matches the email regex, and the file photo has the proper extension
const maxDesc = 172;
const email = /^[\w\-.]+@([\w\-]+\.)+(\w{2,3})$/m;
function validatePetListing(newPet) {
  const status = { valid: 'true', errors: []};

  // name existence & length
  if (!newPet.name || newPet.name.length > 30) {
    status.valid = false;
    status.errors.push('Invalid pet name entered.');
  }
  // pet type
  if(!newPet.animal || !['Cat', 'Dog'].includes(newPet.animal)) {
    status.valid = false;
    status.errors.push('Invalid pet type entered.');
  }
  // breed
  if(!newPet.breed) {
    status.valid = false;
    status.errors.push('Invalid breed entered.');
  }
  // age
  if (newPet.age === undefined || Number(newPet.age) < 0 
    || Number(newPet.age) > 30) {
    status.valid = false;
    status.errors.push('Invalid age entered.');
  }
  // gender
  if (!newPet.gender || !['Male', 'Female'].includes(newPet.gender)) {
    status.valid = false;
    status.errors.push('Invalid gender entered.');
  }
  // behaviour
  if (!newPet.behaviour 
    || !['Cats', 'Dogs', 'Children', 'None - Wild'].some(beh => newPet.behaviour.includes(beh))) {
    status.valid = false;
    status.errors.push('Invalid behaviour entered.');
  }
  // description
  if (!newPet.desc || newPet.desc.length > maxDesc) {
    status.valid = false;
    status.errors.push('Invalid description entered.');
  }
  // owner's name
  if (!newPet['owner-name'] || newPet['owner-name'].length > 50) {
    status.valid = false;
    status.errors.push('Invalid owner name entered.');
  }
  // email format
  if (!newPet.email || !email.test(newPet.email)) {
    console.log("failed here")
    status.valid = false;
    status.errors.push('Invalid email format entered.');
  }

  return status;
}

// validates the query by checking that all validation tests passed
// im so sorry to whoever reads this
function validateQuery(query) {
  return ((!query.animal || !['Cat', 'Dog'].includes(query.animal))
    && (!query.breed)
    && ((query.age === undefined || Number(query.age) < 0 
    || Number(query.age) > 30))
    && (!query.gender || !['Male', 'Female'].includes(query.gender))
    && (!query.behaviour 
      || !['Cats', 'Dogs', 'Children', 'None - Wild'].some(beh => query.behaviour.includes(beh))));
}

// returns true if all query conditions are satisfied
function filterPetQuery(pet, query) {
  console.log(pet)
  // type
  if (query.animal !== pet.animal)
    return false;

  // breed
  if (query.breed !== 'None' && query.breed !== pet.breed)
    return false;

  // age
  if (query.age !== 'None' && Number.parseInt(query.age.match(/\d/)) < Number.parseInt(pet.age.match(/\d/)))
      return false;

  if (query.gender !== 'None' && query.gender !== pet.gender)
    return false;

  // convert into arrays to compare consistently
  if (!Array.isArray(pet.behaviour))
    pet.behaviour = pet.behaviour.split(', ');
  if (!Array.isArray(query.behaviour))
    query.behaviour = query.behaviour.split(', ');

  return query.behaviour.includes('None') || query.behaviour.some(behaviour => pet.behaviour.includes(behaviour));
}

export { 
  writePetListing, 
  getPetListing, 
  validatePetListing, 
  deleteInvalidPhoto, 
  filterPetQuery
};