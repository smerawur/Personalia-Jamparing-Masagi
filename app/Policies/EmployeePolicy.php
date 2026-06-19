<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Employee;

class EmployeePolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    public function view(User $user, Employee $employee)
{
    return $user->role === 'admin' || $user->id === $employee->user_id;
}

    /**
     * Determine whether the user can view any employees (listing).
     */
    public function viewAny(User $user)
    {
        return $user->role === 'admin';
    }
}
