FROM denoland/deno:1.32.1

RUN echo '#!/bin/bash\n\ndeno run --allow-read --allow-net --unsafely-ignore-certificate-errors /app/index.ts $*' > /bin/scz
RUN chmod +x /bin/scz

# RUN echo 'alias scz="deno run --allow-read --allow-net --unsafely-ignore-certificate-errors /app/index.ts"' > /home/.bashrc

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
# docker run --init -it -v $PWD:/scenarios gliluaume/scenarizer:latest scz file.yml
# Powershell
# docker run --init -it -v "$(pwd):/scenarios" gliluaume/scenarizer:latest scz file.yml

CMD ["scz"]
