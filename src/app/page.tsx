'use client';
import React from 'react';
import { Form } from '@heroui/form';
import { useState } from 'react';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Button } from '@heroui/button';
import { Card, CardHeader, CardBody } from '@heroui/card';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const roles = [
    { value: 'teacher', label: 'Teacher' },
    { value: 'student', label: 'Student' },
    { value: 'staff', label: 'Staff' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    console.log({ email, role });
  };

  return (
    <div className="">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col gap-1">
            <h4 className="text-xl font-bold">Registration</h4>
            <p className="text-small text-default-500">Please enter your details</p>
          </CardHeader>
          <CardBody>
            <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <Input
                isRequired
                label="Email"
                placeholder="Enter your email"
                type="email"
                value={email}
                onValueChange={setEmail}
                variant="bordered"
              />

              <Select
                isRequired
                label="Role"
                placeholder="Select your role"
                selectedKeys={role ? [role] : []}
                onChange={(e) => setRole(e.target.value)}
                variant="bordered"
              >
                {roles.map((role) => (
                  <SelectItem key={role.value}>{role.label}</SelectItem>
                ))}
              </Select>

              <Button type="submit" color="primary">
                Submit
              </Button>

              {submitted && (
                <p className="text-small text-success">Registration submitted successfully!</p>
              )}
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
