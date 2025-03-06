import CreateUserForm from './CreateUser';
import UserService from '@/services/user.service';
import UserRegistrationForm from './TestForms';
import LevelForm from './LevelForm';
import { getAllInstitutions } from '@/actions/institution.action';

export default async function HomePage() {
  const institutions = await getAllInstitutions();
  // const users = await new UserService().findAll();
  // console.log(users);
  return (
    <>
      <LevelForm institutions={institutions} /> <UserRegistrationForm />
    </>
  );
}
