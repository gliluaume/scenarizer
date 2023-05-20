#!/bin/bash

deno run --allow-read --allow-env --allow-net test/__mock-server/index.ts &
pid=$!

deno test --allow-all test/functional
ret=$?

kill $pid

exit $ret
