<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Employee;
use App\Http\Requests\StoreContractRequest;
use App\Http\Requests\UpdateContractRequest;
use App\Http\Resources\ContractResource;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    /**
     * List all contracts (admin only).
     * Supports search by employee name.
     */
    public function index(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $query = Contract::with('employee');

        if ($request->search) {
            $query->whereHas('employee', function ($q) use ($request) {
                $q->where('full_name', 'like', '%' . $request->search . '%');
            });
        }

        return ContractResource::collection(
            $query->latest()->paginate(10)
        );
    }

    public function myContract()
    {
        $employee = Employee::where('user_id', auth()->id())->first();

        if (!$employee) {
            return response()->json(['data' => null], 404);
        }

        $contract = Contract::where('employee_id', $employee->id)
            ->where(function ($q) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            })
            ->latest('start_date')
            ->first();

        return response()->json(['data' => $contract]);
    }

    /**
     * Create a new contract (admin only).
     * If the employee already has an open-ended contract, it is
     * automatically closed the day before the new contract starts.
     */
    public function store(StoreContractRequest $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $employeeId = $request->employee_id;

        // Close any existing open-ended contract
        $activeContract = Contract::where('employee_id', $employeeId)
            ->whereNull('end_date')
            ->first();

        if ($activeContract) {
            $activeContract->end_date = Carbon::parse($request->start_date)->subDay();
            $activeContract->save();
        }

        // Ensure employee is marked active
        $employee = Employee::findOrFail($employeeId);
        $employee->status = 'active';
        $employee->save();

        $contract = Contract::create($request->validated());

        return new ContractResource($contract);
    }

    /**
     * Update a contract (admin only).
     * Only active contracts can be edited.
     */
    public function update(UpdateContractRequest $request, Contract $contract)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if (!$this->contractIsActive($contract)) {
            return response()->json(['error' => 'Ended contracts cannot be edited.'], 422);
        }

        $contract->update($request->validated());

        return new ContractResource($contract);
    }

    /**
     * Delete a contract (admin only).
     * Only ended contracts can be deleted.
     */
    public function destroy(Contract $contract)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if ($this->contractIsActive($contract)) {
            return response()->json([
                'error' => 'Active contracts cannot be deleted. End the contract first.',
            ], 422);
        }

        $contract->delete();

        return response()->json(['message' => 'Contract deleted successfully.']);
    }

    /**
     * End a contract today and deactivate the employee.
     */
    public function endContract($id)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $contract = Contract::with('employee')->findOrFail($id);

        // Prevent ending an already-ended contract
        if (!$this->contractIsActive($contract)) {
            return response()->json(['message' => 'Contract already ended.'], 400);
        }

        $contract->end_date = now()->toDateString();
        $contract->save();

        $contract->employee->update(['status' => 'inactive']);

        return response()->json([
            'message'  => 'Contract ended successfully.',
            'contract' => new ContractResource($contract),
        ]);
    }

    /**
     * Helper: check if a contract is currently active.
     * Active = no end_date, or end_date is in the future.
     */
    private function contractIsActive(Contract $contract): bool
    {
        if (!$contract->end_date) return true;
        return now()->toDateString() < $contract->end_date;
    }
}
