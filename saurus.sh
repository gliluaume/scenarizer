#!/bin/bash

ALLOWED_CMDS="test test:coverage run"
function saurus() {

    local COV_DIR=./coverage
    local DENO_CMD=~/.deno/bin/deno

    help="\nUsage:\n\t$0 <$ALLOWED_CMDS>\n"

    if [[ $# -lt 1 ]]
    then
        echo "Command name expected. Usage:"
        echo -e $help
        return 1
    fi

    command=$1
    shift
    case "$command" in
        run)
            $DENO_CMD run --allow-hrtime --allow-env --allow-read --allow-net --unsafely-ignore-certificate-errors src/index.ts $*
        ;;
        test)
            $DENO_CMD test
        ;;
        test:coverage)
            # https://medium.com/deno-the-complete-reference/generate-code-coverage-report-in-deno-c765aa499de8
            $DENO_CMD test --coverage=${COV_DIR}
            $DENO_CMD coverage ${COV_DIR}
            $DENO_CMD coverage ${COV_DIR} --lcov > ${COV_DIR}/coverage.lcov
            genhtml -o ${COV_DIR} ${COV_DIR}/coverage.lcov
            rm -f ${COV_DIR}/.json
        ;;
        *)
            echo "Unknown command <$command>."
            echo -e $help
            return 1
        ;;
    esac
}

saurus $*