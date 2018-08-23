lint:
	npx eslint *.js

test:
	$(MAKE) lint
	node --pending-deprecation --trace-deprecation --throw-deprecation --trace-warnings test.js

publish:
	git push -u --tags origin master
	npm publish

update:
	npx updates -u -e ip-regex
	rm -rf node_modules
	npm i

npm-patch:
	npm version patch

npm-minor:
	npm version minor

npm-major:
	npm version major

patch: lint test npm-patch publish
minor: lint test npm-minor publish
major: lint test npm-major publish

.PHONY: lint test publish update npm-patch npm-minor npm-major patch minor major
