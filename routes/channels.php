<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('rentals', function () {
    return true;
});
