
# only run coverage report
rm -r -fo .coverage
rm -r -fo .coveragereport
deno test --coverage=.coverage
deno coverage --include=src .coverage
deno coverage --include=src .coverage --lcov > .coverage/coverage.lcov
reportgenerator -reports:.coverage/coverage.lcov -targetdir:.coveragereport