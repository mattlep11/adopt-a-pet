import fs from 'node:fs';

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

  if (newUser.user.length < 5) {
    status.ok = false;
    status.errors.push('Username is too short.');
  }
  if (newUser.pass.length < 8
    && !/\d/.test(newUser.pass)
    && !/[!@#$%^&*()\-_=+{}[\]\\|;:'",<.>/?`~]/.test(newUser.pass)) {
      status.ok = false;
      status.errors.push('Password does not meet criteria.');
  }
  if (newUser.pass !== newUser.validation) {
    status.ok = false;
    status.errors.push('Passwords did not match.');
  }

  return status;
}