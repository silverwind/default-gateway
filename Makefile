lint:
	npx eslint *.js

test:
	$(MAKE) lint
	node --pending-deprecation --trace-deprecation --throw-deprecation --trace-warnings test.js

publish:
	git push -u --tags origin master
	npm publish

update:
	npx updates -u
	rm -rf node_modules
	npm i

ver-patch:
	npx ver patch

ver-minor:
	npx ver minor

ver-major:
	npx ver major

patch: lint test ver-patch publish
minor: lint test ver-minor publish
major: lint test ver-major publish

.PHONY: lint test publish update npm-patch npm-minor npm-major patch minor major
