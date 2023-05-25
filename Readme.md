<div align="center">
	<img src="docs/icon.ico" width="200" height="200">
	<h1>Scenarizer</h1>
	<p>
		<b>Testing HTTP APIs working with JSON</b>
	</p>
	<br>
</div>

Supports only HTTP APIs that handle JSON content.

Useful to handle a sequential set of requests, handle an application state and make exhaustive assertions on what is expected as response.

See documentation [here](https://gliluaume.github.io/scenarizer).


##  Dev notes
run
```bash
$ deno task start .\scenario.yml
```

Deployment (no Ci for now):
manual tag
```bash
git tag X.Y.Z && git push-tags
```

build docker image:
```bash
docker build --tag gliluaume/scenarizer:X.Y.Z .
```

publish docker image
```bash
docker login
docker push gliluaume/scenarizer:X.Y.Z
```

update doc
```bash
$ deno task start docs/samples/assertion-body.yml | ansi2html > docs/output-samples/assertion-body.html
```

## TODO
- [ ] improve test coverage
- [x] add functional test
- [ ] add multi-file support
- [ ] score calculation based on swagger description (check which verb / path is covered)
