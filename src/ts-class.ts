type User = string | { name: string; age: number; }

interface Person {
  person: User
}

const person = {
  person: "Kev"
  // person: {
  //   age:1,
  //   name: 'kev'
  // }
} satisfies Person;

// person.person.

type Species = "cat" | "dog"

interface Pet {
  species: Species;
}

class Cat implements Pet {
  public species: Species = "cat"

  public meow(): void {
    console.log("meow")
  }
}

const p: Pet = new Cat();

function petIsCat(pet: Pet): pet is Cat {
  return pet.species === "cat";
}

function petIsCatBoolean(pet: Pet): boolean {
  return pet.species === "cat";
}

if (petIsCat(p)) {
  p.meow();
}

if (petIsCatBoolean(p)) {
  (p as Cat).meow();
}

interface IUser {
  email: string;
  name: string;
  password: string;
}

interface IAdminUser extends IUser {
  token: string;
}

export function check() {
  return {
    isAdmin(object: unknown): object is IAdminUser {
      if (object !== null && typeof object === "object") {
          return "token" in object;
        }
      return false;
    },
    isUser(object: unknown): object is IUser {
      if (object !== null && typeof object === "object") {
          /* eslint-disable */
          return "token" !in object;
        }
      return false;
    },
  }
}

const user = {};

if (check().isAdmin(user)) {
  user.token
} else if (check().isUser(user)) {
  user.name
}

// console.log(IsAdmin({
//   email: 'kev@gmail.com',
//   name: 'kev',
//   password: 'kev123',
//   token: ''
// }))