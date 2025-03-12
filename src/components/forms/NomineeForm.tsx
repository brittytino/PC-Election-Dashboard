
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addNominee } from '@/lib/db';
import { departments, positions, isEligibleForPosition, Position, getYearFromRegNo, Nominee } from '@/types/nominee';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  regNo: z.string().min(8, 'Registration number must be at least 8 characters'),
  shift: z.coerce.number().min(1).max(2),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function NomineeForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      regNo: '',
      shift: 1,
      department: '',
      position: '',
    },
  });

  const watchShift = watch('shift');
  const watchRegNo = watch('regNo');
  const watchPosition = watch('position') as Position;

  const checkEligibility = () => {
    if (watchPosition && watchRegNo && watchShift) {
      const isEligible = isEligibleForPosition(watchPosition, watchShift, watchRegNo);
      if (!isEligible) {
        const year = getYearFromRegNo(watchRegNo);
        setEligibilityError(`This candidate is not eligible for ${watchPosition}. Required: Year ${year === 3 ? 3 : 2}, Shift ${watchPosition === 'Chairman' || watchPosition === 'Secretary' ? 1 : 2}`);
        return false;
      }
      setEligibilityError(null);
      return true;
    }
    return false;
  };

  const onSubmit = async (data: FormValues) => {
    if (!checkEligibility()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const nomineeData: Nominee = {
        id: uuidv4(),
        name: data.name,
        email: data.email,
        regNo: data.regNo,
        shift: data.shift,
        department: data.department,
        position: data.position as Position,
        votes: 0,
        nominatedAt: new Date(),
      };

      await addNominee(nomineeData);
      toast({
        title: 'Success',
        description: 'Nominee added successfully',
      });
      reset();
    } catch (error) {
      console.error('Error adding nominee:', error);
      toast({
        title: 'Error',
        description: 'Failed to add nominee',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Add Election Nominee</CardTitle>
        <CardDescription>
          Add a new nominee for the Programming Club election
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="regNo">Registration Number</Label>
            <Input 
              id="regNo" 
              {...register('regNo')} 
              onChange={(e) => {
                setValue('regNo', e.target.value);
                checkEligibility();
              }}
            />
            {errors.regNo && (
              <p className="text-sm text-red-500">{errors.regNo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift">Shift</Label>
            <Select 
              onValueChange={(value) => {
                setValue('shift', parseInt(value));
                checkEligibility();
              }}
              defaultValue={watchShift.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Shift 1</SelectItem>
                <SelectItem value="2">Shift 2</SelectItem>
              </SelectContent>
            </Select>
            {errors.shift && (
              <p className="text-sm text-red-500">{errors.shift.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select onValueChange={(value) => setValue('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && (
              <p className="text-sm text-red-500">{errors.department.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select 
              onValueChange={(value) => {
                setValue('position', value);
                checkEligibility();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.position && (
              <p className="text-sm text-red-500">{errors.position.message}</p>
            )}
          </div>

          {eligibilityError && (
            <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
              {eligibilityError}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => reset()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !!eligibilityError}>
            {isSubmitting ? 'Submitting...' : 'Add Nominee'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
