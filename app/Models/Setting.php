<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        if ($setting === null) {
            return $default;
        }

        // Try to decode as JSON if it's valid JSON
        $decoded = json_decode($setting->value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $setting->value;
    }

    public static function set(string $key, mixed $value): self
    {
        $setting = static::firstOrNew(['key' => $key]);
        $setting->value = is_array($value) ? json_encode($value) : (string) $value;
        $setting->save();

        return $setting;
    }
}
