'use client';
import React from 'react';
// import { Form } from '@heroui/form';
// import { useState } from 'react';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Button } from '@heroui/button';
// import { Card, CardHeader, CardBody } from '@heroui/card';

// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { userSchema } from '@/types/user';
import UserServerAction from '@/actions/user.action';

const roles = [
  { key: 'teacher', label: 'Teacher' },
  { key: 'student', label: 'Student' },
  { key: 'staff', label: 'Staff' },
];
export default function CreateUserForm() {
  // const [serverErrors, setServerErrors] = useState(null);
  // const [email, setEmail] = useState('');
  // const [role, setRole] = useState('');
  // const [submitted, setSubmitted] = useState(false);

  // const form = useForm({
  //   resolver: zodResolver(userSchema),
  //   defaultValues: { email: '', password: '', role: 'STUDENT' },
  // });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 🔹 Convert to FormData for Server Action
    const formDataObject = new FormData(e.currentTarget);

    // 🔹 Log FormData before submitting
    console.log('📌 FormData Contents:');
    for (const [key, value] of formDataObject.entries()) {
      console.log(`${key}:`, value);
    }

    // 🔹 Call Server Action
    const result = await new UserServerAction().createUser(formDataObject);

    if (!result.success) {
      console.error('❌ Server Errors:', result.errors);
    } else {
      alert('✅ User created successfully!');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold mb-4">Register User</h2>
      {/* <Form {...form}> */}
      <form onSubmit={onSubmit} className="space-y-12 w-full">
        {/* Email Field */}
        <Input
          color="default"
          variant="bordered"
          labelPlacement="outside"
          size="sm"
          isRequired
          label="Email"
          placeholder="Enter your email"
          type="email"
          name="email"
        />

        {/* Password Field */}
        <Input
          color="default"
          variant="bordered"
          labelPlacement="outside"
          size="sm"
          isRequired
          label="Password"
          placeholder="Enter your Password"
          type="password"
          name="password"
        />

        <Select className="" label="Select a role">
          {roles.map((role) => (
            <SelectItem key={role.key}>{role.label}</SelectItem>
          ))}
        </Select>

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          Register
        </Button>

        {/* Server Side Errors */}
        {/* {serverErrors && (
            <div className="text-red-500 text-sm mt-2">
              {Object.values(serverErrors).map((msg, index) => (
                <p key={index}>{msg}</p>
              ))}
            </div>
          )} */}
      </form>
      {/* </Form> */}
    </div>
  );
}
