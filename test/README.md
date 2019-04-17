enuk-web tests
==============

Tests are written and run using the mocha/chai framework.

Setup
-----

Tests will use the database configurations from `config/config.ini`.
To run tests, you need to edit the database configuration to use a
different table than production **and** set the server mode to "test".

These safeguards are in place to ensure that tests are no accidentally
run where they may unsafely modify database entries.
