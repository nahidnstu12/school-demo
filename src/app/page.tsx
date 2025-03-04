import CreateUserForm from './CreateUser';
import UserService from '@/services/user.service';
import UserRegistrationForm from './TestForms';

export default async function HomePage() {
  const users = await new UserService().findAll();
  // console.log(users);
  return <UserRegistrationForm />;
}
