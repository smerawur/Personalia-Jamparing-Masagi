<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CheckCreateToken extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:create-token';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check User runtime class and createToken availability';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $user = User::first();

        if (! $user) {
            $this->warn('No users found — creating a test user: test@example.com / password');
            $user = User::create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => Hash::make('password'),
            ]);
        }

        $this->info('User class: ' . get_class($user));
        $this->info('Has createToken: ' . (method_exists($user, 'createToken') ? 'yes' : 'no'));

        return 0;
    }
}
