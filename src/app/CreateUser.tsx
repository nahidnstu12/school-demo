'use client';

import React, { useState } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';

import { createUser } from '@/actions/user.action';
import { UserRole } from '@prisma/client';

const roles = [
  { key: UserRole.TEACHER, label: 'Teacher' },
  { key: UserRole.STUDENT, label: 'Student' },
  { key: UserRole.STAFF, label: 'Staff' },
];

export default function CreateUserForm() {
  const [selectedRole, setSelectedRole] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 🔹 Convert to FormData for Server Action
    const formDataObject = new FormData(e.currentTarget);

    // 🔹 Manually add the role value to FormData
    if (selectedRole) {
      formDataObject.set('role', selectedRole);
    }

    // 🔹 Log FormData before submitting
    console.log('📌 FormData Contents:');
    for (const [key, value] of formDataObject.entries()) {
      console.log(`${key}:`, value);
    }

    // 🔹 Call Server Action
    const result = await createUser(formDataObject);

    if (!result.success) {
      console.error('❌ Server Errors:', result.errors);
    } else {
      alert('✅ User created successfully!');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold mb-4">Register User</h2>
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

        {/* Role Selection - Fixed to include name and onChange */}
        <Select
          label="Select a role"
          name="role"
          selectedKeys={selectedRole ? [selectedRole] : []}
          onSelectionChange={(keys) => {
            // Convert the Set to a string (assuming single selection)
            const selected = Array.from(keys)[0]?.toString() || '';
            setSelectedRole(selected);
          }}
        >
          {roles.map((role) => (
            <SelectItem key={role.key} value={role.key}>
              {role.label}
            </SelectItem>
          ))}
        </Select>

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          Register
        </Button>
      </form>
    </div>
  );
}
