FROM denoland/deno:1.32.1

WORKDIR /app

# Prefer not to run as root.
USER deno

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
COPY deps.ts .
RUN deno cache deps.ts

# These steps will be re-run upon each file change in your working directory:
# ADD . .
COPY ./src /app

# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache index.ts

WORKDIR /scenarios
# Bash
# docker run --init -it -v $PWD:/scenarios gliluaume/scenarizer:latest
# Powershell
# docker run --init -it -v "$(pwd):/scenarios" gliluaume/scenarizer:latest
ENTRYPOINT ["deno", "run", "--allow-read", "--allow-net", "--unsafely-ignore-certificate-errors", "/app/index.ts"]
CMD ["-h"]
