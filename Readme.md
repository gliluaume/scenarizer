# Scenarizer

This tools supports only HTTP APIs that handle JSON messages.

This is useful to handle a sequential set of requests and make exhaustive assertions on what is expected as response.

See documentation [here](https://gliluaume.github.io/scenarizer).


##  Starting
run
```
deno run --allow-read --allow-net --unsafely-ignore-certificate-errors .\src\index.ts .\scenario.yml
```

Deployment (no Ci for now):
manual tag
```
git tag X.Y.Z && git push-tags
```

build docker image:
```
docker build --tag gliluaume/scenarizer:X.Y.Z .
```

publish docker image
```
docker login
docker push gliluaume/scenarizer:X.Y.Z
```
