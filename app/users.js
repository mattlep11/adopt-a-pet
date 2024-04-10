import fs from 'node:fs/promises';

export async function findUser(path, username) {
  const file = await fs.open(path, 'r');
  
  let target = [];
  for await (const line of file.readLines()) {
    const user = line.split(':');
    if (username === user[0]) {
      target = user;
      break;
    }
  }

  return target;
}

export function writeUser(path, newUser) {
  const entry = `${newUser.user.trim()}:${newUser.pass}`;

  try {
    fs.appendFile(path, entry + '\n');
    return true;
  } catch (err) {
    console.error(`Something went wrong: ${err.message}`);
    return false;
  }
}

// returns true if the username already exists
export async function collidesUsername(path, username) {
  const target = await findUser(path, username);
  return target.length > 0;
}

function hasSymbol(str) {
  /[!@#$%^&*()\-_=+{}[\]\\|;:'",<.>/?`~]/.test(str);
}

const maxLength = 64;
export function validateSignIn(user) {
  let status = { ok: true, errors: [] };

  Object.keys(user).forEach(k => {
    if (!user[k] || user[k].length > maxLength) {
      status.ok = false;
      status.errors.push(`Invalid ${k}`);
    }
  });

  return status;
}

// verifies all base requirements are met for new account details
export function validateAccountCreation(newUser) {
  let status = { ok: true, errors: [] };

  if (newUser.user.length < 5 || hasSymbol(newUser.user)) {
    status.ok = false;
    status.errors.push('Username does not meet criteria');
  }
  if (newUser.pass.length < 8
    || !/[A-Za-z]/.test(newUser.pass)
    || !/\d/.test(newUser.pass)
    || hasSymbol(newUser.pass)) {
      status.ok = false;
      status.errors.push('Password does not meet criteria.');
  }
  if (newUser.pass !== newUser.validation) {
    status.ok = false;
    status.errors.push('Passwords did not match.');
  }

  return status;
}
