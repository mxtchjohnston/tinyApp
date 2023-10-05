const generateRandomString = (num) => {
  const randomNum = () => Math.floor(Math.random() * 26) + 97;
  const array = [];
  for (let i = 0; i < num; i++) {
    array.push(randomNum());
  }
  return String.fromCodePoint(...array);
};

const getUserByEmail = (email, userDatabase) => {
  let found = undefined;

  for (const key in userDatabase) {
    if (userDatabase[key].email === email) {
      found = userDatabase[key];
      break;
    }
  }

  return found;
};

const objectFilter = (object, predicate) => {
  const toReturn = {}
  for (const key in object) {
    if (predicate(object[key])) toReturn[key] = object[key];
  }
  return toReturn;
};

const getUrlsForUser = (dictionary, userID) => {
  return objectFilter(dictionary, k => k.userID === userID)
};

module.exports = {generateRandomString, getUserByEmail, getUrlsForUser}