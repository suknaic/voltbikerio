<?php

test('returns a redirect response', function () {
    /** @var \Tests\TestCase $this */
    $response = $this->get(route('home'));

    $response->assertRedirect(route('login'));
});
