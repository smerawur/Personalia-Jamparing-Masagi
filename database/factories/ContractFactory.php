<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Contract>
 */
class ContractFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'employee_id' => 1,
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->date(),
            'position' => $this->faker->word(),
            'contract_type' => $this->faker->randomElement(['Full-time', 'PKWT', 'Shift Work', 'Temporary']),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
