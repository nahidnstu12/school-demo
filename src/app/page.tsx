import CreateUserForm from './CreateUser';
import UserService from '@/services/user.service';

export default async function HomePage() {
  const users = await new UserService().findAll();
  // console.log(users);
  return <CreateUserForm />;
}
