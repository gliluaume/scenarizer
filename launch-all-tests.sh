#!/bin/bash

Cred="\x1b[31m"
Cgreen="\x1b[32m"
Cgreenl="\x1b[1;32m"
Cyellow="\x1b[33m"
Cblue="\x1b[34m"
Cmagenta="\x1b[35m"
Cbluel="\x1b[36m"
Cwhite="\x1b[37m"
Cpurple="\x1b[34m"
CbgRed="\x1b[41m"
CbgGreen="\x1b[42m"
CbgYellow="\x1b[43m"
CbgBlue="\x1b[44m"
CbgMagenta="\x1b[45m"
CbgWhite="\x1b[47m"
CbgBluel="\x1b[46m"
Cbold="\x1b[1m"
Creset="\x1b[0m"

echo -e "${CbgWhite}${Cbold} Starting functional test ${Creset}"
echo "🚀 launching mock server"
deno run --allow-read --allow-env --allow-net test/__mock-server/index.ts &
pid=$!

echo -e "🧪 lauching test suite\x1b[0m"
# deno test --allow-all --coverage=.coverage test/functional
deno test --allow-all --coverage=.coverage test/ && \
deno coverage --include=src .coverage &&\
deno coverage --include=src .coverage --lcov --output=.coverage/coverage.lcov &&\
genhtml -o .coverage .coverage/coverage.lcov &&\
rm -f .coverage/.json
ret=$?

echo "🚀 stopping mock server"
kill $pid

exit $ret
