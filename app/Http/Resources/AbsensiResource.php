<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AbsensiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'employee_id'     => $this->employee_id,
            'date'            => $this->date,
            'status'          => $this->status,
            'image_path'      => $this->image_path,
            'latitude'        => $this->latitude,
            'longitude'       => $this->longitude,
            'address'         => $this->address,
            'keterangan'      => $this->keterangan,
            'approval_status' => $this->approval_status,
            'created_at'      => $this->created_at,
            'employee_name'   => $this->employee?->full_name,
        ];
    }
}