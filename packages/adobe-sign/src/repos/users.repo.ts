import { injectable } from "tsyringe";

export class User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  customField: string;

  /* istanbul ignore next */
  constructor(data: Partial<User>) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.customField = data.customField;
  }
}

@injectable()
export class UsersRepo {
  /* istanbul ignore next */
  public async getUserById(id: string): Promise<User> {
    return {
      id: id,
      email: 'ngleapai@gmail.com',
      firstName: 'Noah',
      lastName: 'Leapai',
      customField: 'some random value'
    }
  }
}